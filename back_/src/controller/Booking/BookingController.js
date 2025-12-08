import { catchAsync } from '../../middleware/errorHandler.js';
import { bookingService } from '../../services/businessServices.js';
import { prisma } from '../../config/prismaClient.js';
import { NotFoundError, ConflictError } from '../../middleware/errorHandler.js';
import pkg from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique tokens
import { sendCancelEmail, sendConfirmationEmail } from '../../services/emailService.js';
import { sendSms } from '../../services/smsService.js';

const { Role, SlotStatus } = pkg;

/**
 * Cria um novo agendamento
 * POST /api/bookings
 */
export const createBooking = catchAsync(async (req, res) => {
    const { slotId } = req.body;
    const userId = req.user.userId;

    const booking = await bookingService.createBooking(userId, slotId);

        res.status(201).json(booking);

    });

    

    /**

     * Cancela um agendamento usando token

     * DELETE /api/bookings/cancel?token=xxx

     */

    export const cancelBooking = catchAsync(async (req, res) => {

        const { token } = req.query;

    

        if (!token) {

            return res.status(400).json({ error: 'Token de cancelamento é obrigatório.' });

        }

    

        const result = await bookingService.cancelBookingByToken(token);

    

        res.status(200).json(result);

    });

    

    

    /**

     * Lista agendamentos do cliente autenticado

     * GET /api/bookings?page=1&limit=10&status=PENDING

     */
export const getClientBookings = catchAsync(async (req, res) => {
    console.log('--- GET CLIENT BOOKINGS ---');
    console.log('User from token:', JSON.stringify(req.user, null, 2));
    
    const { userId, role } = req.user;

    if (role !== Role.CLIENT) {
        return res.status(403).json({ error: 'Apenas clientes podem acessar esta rota.' });
    }

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };

    console.log('Query Options:', JSON.stringify(options, null, 2));

    try {
        const result = await bookingService.getClientBookings(userId, options);
        console.log('Result from service:', JSON.stringify(result, null, 2));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getClientBookings controller:', error);
        res.status(500).json({ error: 'Internal Server Error in Controller' });
    }
});

/**
 * Lista agendamentos do provedor
 * GET /api/bookings/provider?page=1&date=2025-12-05&serviceId=xxx
 */
export const getProviderBookings = catchAsync(async (req, res) => {
    const { userId, role } = req.user;

    if (role !== Role.PROVIDER) {
        return res.status(403).json({ error: 'Apenas provedores podem acessar esta rota.' });
    }

    // Buscar providerId do usuário
    const provider = await prisma.provider.findUnique({
        where: { ownerId: userId }
    });

    if (!provider) {
        throw new NotFoundError('Provedor não encontrado para este usuário.');
    }

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        serviceId: req.query.serviceId,
        staffId: req.query.staffId,
    };

    const result = await bookingService.getProviderBookings(provider.id, options);

    res.status(200).json(result);
});

/**
 * Provedor cancela um agendamento
 * DELETE /api/bookings/:bookingId/provider-cancel
 */
export const providerCancelBooking = catchAsync(async (req, res) => {
    const { bookingId } = req.params;
    const { userId, role } = req.user;

    if (role !== Role.PROVIDER) {
        return res.status(403).json({ error: 'Apenas provedores podem cancelar agendamentos.' });
    }

    // Buscar providerId
    const provider = await prisma.provider.findUnique({
        where: { ownerId: userId }
    });

    if (!provider) {
        throw new NotFoundError('Provedor não encontrado.');
    }

    const result = await bookingService.providerCancelBooking(bookingId, provider.id);

    res.status(200).json(result);
});

export const createGuestBooking = catchAsync(async (req, res) => {
    const { name, email, phone, password, slotId } = req.body;

    // 1. Validação de entrada
    if (!name || !email || !password || !slotId) {
        return res.status(400).json({ error: 'Nome, email, senha e ID do horário são obrigatórios.' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 2. Verificar se o e-mail já está em uso
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new ConflictError('Este email já está registrado. Por favor, faça login para agendar.');
            }

            // 3. Hash da senha
            const hashedPassword = await bcrypt.hash(password, 10);

            // 4. Criar o novo usuário
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    password: hashedPassword,
                    role: Role.CLIENT,
                },
            });

            // 5. Verificar a disponibilidade do slot e fazer lock (proteção contra concorrência)
            const slot = await tx.availabilitySlot.findUnique({
                where: { id: slotId },
                include: { service: true, provider: true }, // Include service and provider for email
            });

            if (!slot) {
                throw new NotFoundError('Horário não encontrado.');
            }
            
            // Verificar se o slot ainda está disponível e não está no passado
            if (slot.status !== SlotStatus.OPEN) {
                throw new ConflictError('Este horário não está mais disponível.');
            }
            
            if (new Date(slot.startAt) < new Date()) {
                throw new ConflictError('Não é possível agendar horários no passado.');
            }

            // 6. Gerar token de cancelamento
            const cancelToken = uuidv4();
            const cancelTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

            // 7. Criar o agendamento (Booking)
            const newBooking = await tx.booking.create({
                data: {
                    userId: newUser.id,
                    slotId: slotId,
                    cancelToken,
                    cancelTokenExp,
                    status: 'CONFIRMED', // Status padrão
                },
            });

            // 8. Atualizar o status do slot COM LOCK (garante que só atualiza se ainda estiver OPEN)
            const updatedSlot = await tx.availabilitySlot.updateMany({
                where: { 
                    id: slotId,
                    status: SlotStatus.OPEN // Só atualiza se ainda estiver OPEN (proteção contra concorrência)
                },
                data: {
                    status: SlotStatus.BOOKED,
                    bookingId: newBooking.id,
                },
            });
            
            // Se nenhum registro foi atualizado, significa que o slot foi agendado por outro usuário
            if (updatedSlot.count === 0) {
                throw new ConflictError('Este horário não está mais disponível (foi agendado por outro usuário).');
            }

            // 9. Enviar emails
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Assuming frontend URL is in env
            const cancelUrl = `${frontendUrl}/cancel-booking?token=${cancelToken}`;

            await sendConfirmationEmail(newUser.email, slot, newBooking);
            await sendCancelEmail(newUser.email, slot, newBooking, cancelUrl);

            // Enviar SMS se o número de telefone for fornecido
            if (newUser.phone) {
                const smsBody = `Seu agendamento para ${slot.service.name} foi confirmado. Para cancelar, acesse: ${cancelUrl}`;
                await sendSms(newUser.phone, smsBody);
            }


            return { user: newUser, booking: newBooking };
        });

        // Retornar usuário e agendamento criados
        res.status(201).json(result);

    } catch (error) {
        // Tratar erros específicos da transação
        if (error instanceof ConflictError || error instanceof NotFoundError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        // Tratar erro de e-mail duplicado do Prisma
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
             return res.status(409).json({ error: 'Este email já está registrado. Por favor, faça login para agendar.' });
        }
        console.error('Erro na transação de agendamento de convidado:', error);
        res.status(500).json({ error: 'Falha ao criar agendamento e usuário.' });
    }
});
