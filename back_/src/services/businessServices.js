// ==============================================
// CAMADA DE SERVIÇOS - REFATORAÇÃO COMPLETA
// ==============================================

import { prisma } from '../config/prismaClient.js';
import { AppError, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import pkg from '@prisma/client';
const { BookingStatus, SlotStatus } = pkg;

// ==============================================
// BOOKING SERVICE
// ==============================================

class BookingService {
    /**
     * Cria um novo agendamento
     * @param {string} userId - ID do usuário
     * @param {string} slotId - ID do slot
     * @returns {Promise<Object>} - Booking criado
     */
    async createBooking(userId, slotId) {
        // 1. Validar slot e usuário em paralelo
        const [slot, user] = await Promise.all([
            this.validateSlot(slotId),
            this.validateUser(userId)
        ]);

        // 2. Verificar se usuário já tem booking neste horário
        await this.checkUserAvailability(userId, slot.startAt);

        // 3. Criar booking em transação
        const booking = await this.createBookingTransaction(user, slot);

        // 4. Enviar email de confirmação (assíncrono, não bloqueia)
        this.sendConfirmationEmailAsync(booking).catch(err => {
            console.error('Erro ao enviar email de confirmação:', err);
        });

        return booking;
    }

    /**
     * Valida se o slot existe e está disponível
     */
    async validateSlot(slotId) {
        const slot = await prisma.availabilitySlot.findUnique({
            where: { id: slotId },
            include: {
                service: {
                    include: {
                        provider: true
                    }
                }
            }
        });

        if (!slot) {
            throw new NotFoundError('Slot não encontrado');
        }

        if (slot.status !== SlotStatus.OPEN) {
            throw new ValidationError('Este horário não está mais disponível');
        }

        // Verificar se a data/hora ainda é futura
        if (new Date(slot.startAt) < new Date()) {
            throw new ValidationError('Não é possível agendar horários no passado');
        }

        return slot;
    }

    /**
     * Valida se o usuário existe
     */
    async validateUser(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true
            }
        });

        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }

        // Validar se usuário completou o perfil
        if (!user.name || !user.phone) {
            throw new ValidationError('Complete seu perfil antes de fazer um agendamento');
        }

        return user;
    }

    /**
     * Verifica se usuário não tem conflito de horários
     */
    async checkUserAvailability(userId, slotStartTime) {
        const existingBooking = await prisma.booking.findFirst({
            where: {
                userId,
                status: {
                    not: BookingStatus.CANCELLED
                },
                slot: {
                    startAt: slotStartTime
                }
            }
        });

        if (existingBooking) {
            throw new ValidationError('Você já tem um agendamento neste horário');
        }
    }

    /**
     * Cria o booking em uma transação
     */
    async createBookingTransaction(user, slot) {
        return await prisma.$transaction(async (tx) => {
            // 1. Atualizar status do slot (lock para evitar concorrência)
            const updatedSlot = await tx.availabilitySlot.update({
                where: { 
                    id: slot.id,
                    status: SlotStatus.OPEN // Garante que só atualiza se ainda estiver OPEN
                },
                data: { status: SlotStatus.BOOKED }
            });
            
            if (!updatedSlot) {
                throw new ValidationError('Este horário não está mais disponível (foi agendado por outro usuário)');
            }

            // 2. Criar booking e vincular ao slot
            const booking = await tx.booking.create({
                data: {
                    userId: user.id,
                    slotId: slot.id,
                    status: BookingStatus.CONFIRMED
                },
                include: {
                    slot: {
                        include: {
                            service: {
                                include: {
                                    provider: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });

            // 3. Atualizar slot com bookingId para manter integridade referencial
            await tx.availabilitySlot.update({
                where: { id: slot.id },
                data: { bookingId: booking.id }
            });

            return booking;
        });
    }

    /**
     * Cancela um agendamento
     */
    async cancelBooking(bookingId, userId, userRole) {
        const booking = await this.findBookingById(bookingId);

        // Verificar permissão
        if (booking.userId !== userId && userRole !== 'ADMIN' && userRole !== 'PROVIDER') {
            throw new ValidationError('Você não tem permissão para cancelar este agendamento');
        }

        // Verificar se já foi cancelado
        if (booking.status === BookingStatus.CANCELLED) {
            throw new ValidationError('Este agendamento já foi cancelado');
        }

        // Verificar se já passou
        if (new Date(booking.slot.startAt) < new Date()) {
            throw new ValidationError('Não é possível cancelar agendamentos passados');
        }

        // Cancelar em transação
        return await this.cancelBookingTransaction(booking);
    }

    async findBookingById(bookingId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                slot: {
                    include: {
                        service: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!booking) {
            throw new NotFoundError('Agendamento não encontrado');
        }

        return booking;
    }

    async cancelBookingTransaction(booking) {
        return await prisma.$transaction(async (tx) => {
            // 1. Atualizar booking
            const updatedBooking = await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancelledAt: new Date()
                }
            });

            // 2. Liberar slot
            await tx.availabilitySlot.update({
                where: { id: booking.slotId },
                data: { status: SlotStatus.OPEN, bookingId: null }
            });

            return updatedBooking;
        });
    }

    /**
     * Busca agendamentos do cliente com filtros e paginação
     */
    async getClientBookings(userId, options = {}) {
        console.log(`--- Getting client bookings for userId: ${userId} ---`);
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate
        } = options;

        const where = {
            userId,
            ...(status && { status }),
            ...(startDate || endDate) && {
                slot: {
                    startAt: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) })
                    }
                }
            }
        };

        const skip = (page - 1) * limit;

        const include = {
            slot: {
                include: {
                    service: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            priceCents: true,
                            imageUrl: true
                        }
                    },
                    provider: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        };

        console.log("Prisma Query 'where' clause:", JSON.stringify(where, null, 2));
        console.log("Prisma Query 'include' clause:", JSON.stringify(include, null, 2));

        try {
            const [bookings, total] = await Promise.all([
                prisma.booking.findMany({
                    where,
                    skip,
                    take: limit,
                    include,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma.booking.count({ where })
            ]);
    
            return {
                data: bookings,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error in getClientBookings service:', error);
            throw error; // Re-throw to be caught by catchAsync
        }
    }

    /**
     * Busca agendamentos do provedor
     */
    async getProviderBookings(providerId, options = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            serviceId
        } = options;

        // Verificar se provedor existe
        const provider = await prisma.provider.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            throw new NotFoundError('Provedor não encontrado');
        }

        const where = {
            slot: {
                service: {
                    providerId,
                    ...(serviceId && { id: serviceId })
                },
                ...(startDate || endDate) && {
                    startAt: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) })
                    }
                }
            },
            ...(status && { status })
        };

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    slot: {
                        include: {
                            service: {
                                select: {
                                    id: true,
                                    name: true,
                                    priceCents: true,
                                    imageUrl: true
                                }
                            },
                            staff: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    slot: {
                        startAt: 'asc'
                    }
                }
            }),
            prisma.booking.count({ where })
        ]);

        return {
            data: bookings,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Cancela booking usando token de cancelamento
     */
    async cancelBookingByToken(token) {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findFirst({
                where: { cancelToken: token },
                include: { slot: true },
            });

            if (!booking) {
                throw new NotFoundError('Agendamento não encontrado ou token inválido.');
            }

            if (booking.cancelTokenExp && new Date() > booking.cancelTokenExp) {
                throw new ValidationError('Token de cancelamento expirado.');
            }

            if (booking.status === BookingStatus.CANCELLED) {
                return { message: 'Agendamento já foi cancelado.', booking };
            }

            // Atualizar booking
            const updatedBooking = await tx.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
            });

            // Liberar slot
            await tx.availabilitySlot.update({
                where: { id: booking.slotId },
                data: { status: SlotStatus.OPEN, bookingId: null },
            });

            return { message: 'Agendamento cancelado com sucesso.', booking: updatedBooking };
        });
    }

    /**
     * Provedor cancela um agendamento
     */
    async providerCancelBooking(bookingId, providerId) {
        return await prisma.$transaction(async (tx) => {
            // Buscar booking e verificar se pertence ao provedor
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: {
                    slot: {
                        include: {
                            service: {
                                select: {
                                    providerId: true
                                }
                            }
                        }
                    },
                },
            });

            if (!booking) {
                throw new NotFoundError('Agendamento não encontrado.');
            }

            if (booking.slot.service.providerId !== providerId) {
                throw new ValidationError('Você não tem permissão para cancelar este agendamento.');
            }

            if (booking.status === BookingStatus.CANCELLED) {
                return { message: 'Agendamento já foi cancelado.', booking };
            }

            // Atualizar booking
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
            });

            // Liberar slot
            await tx.availabilitySlot.update({
                where: { id: booking.slotId },
                data: { status: SlotStatus.OPEN, bookingId: null },
            });

            return { message: 'Agendamento cancelado com sucesso pelo provedor.', booking: updatedBooking };
        });
    }

    /**
     * Envia email de confirmação (assíncrono)
     */
    async sendConfirmationEmailAsync(booking) {
        const { sendConfirmationEmail } = await import('../services/emailService.js');
        return await sendConfirmationEmail(booking);
    }
}

// ==============================================
// SERVICE SERVICE (Gerenciamento de Serviços)
// ==============================================

class ServiceService {
    async createService(providerId, serviceData) {
        const { name, description, duration, price } = serviceData;

        // Validar provedor
        const provider = await prisma.provider.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            throw new NotFoundError('Provedor não encontrado');
        }

        // Criar serviço
        const service = await prisma.service.create({
            data: {
                name,
                description,
                duration,
                price,
                providerId
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return service;
    }

    async updateService(serviceId, userId, serviceData) {
        // Buscar serviço com provedor
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                provider: true
            }
        });

        if (!service) {
            throw new NotFoundError('Serviço não encontrado');
        }

        // Verificar se usuário é dono do serviço
        if (service.provider.ownerId !== userId) {
            throw new ValidationError('Você não tem permissão para editar este serviço');
        }

        // Atualizar serviço
        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: serviceData
        });

        return updatedService;
    }

    async deleteService(serviceId, userId) {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                provider: true
            }
        });

        if (!service) {
            throw new NotFoundError('Serviço não encontrado');
        }

        if (service.provider.ownerId !== userId) {
            throw new ValidationError('Você não tem permissão para deletar este serviço');
        }

        // Verificar se há bookings ativos
        const activeBookings = await prisma.booking.count({
            where: {
                slot: {
                    serviceId
                },
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
                }
            }
        });

        if (activeBookings > 0) {
            throw new ValidationError(
                'Não é possível deletar um serviço com agendamentos ativos. Cancele-os primeiro.'
            );
        }

        // Deletar serviço
        await prisma.service.delete({
            where: { id: serviceId }
        });

        return { message: 'Serviço deletado com sucesso' };
    }

    async getServices(providerId, options = {}) {
        const { page = 1, limit = 20, search } = options;
        const skip = (page - 1) * limit;

        const where = {
            ...(providerId && { providerId }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            })
        };

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                skip,
                take: limit,
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            availabilitySlots: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.service.count({ where })
        ]);

        return {
            data: services,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

// Exportar instâncias dos serviços
export const bookingService = new BookingService();
export const serviceService = new ServiceService();
