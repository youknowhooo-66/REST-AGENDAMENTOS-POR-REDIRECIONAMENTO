import { prisma } from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { SlotStatus, BookingStatus, Role } = pkg;

class AppointmentController {

    // CREATE (Book an AvailabilitySlot)
    async create(req, res) {
        const { slotId, userId } = req.body; // userId is the client making the booking
        const { userId: requesterId, role: requesterRole } = req.user; // Authenticated user

        // Clients can only book for themselves, Providers/Admins can book for others
        if (requesterRole === Role.CLIENT && requesterId !== userId) {
            return res.status(403).json({ error: 'Clientes só podem agendar para si mesmos.' });
        }
        
        if (!slotId || !userId) {
            return res.status(400).json({ error: 'ID do slot e ID do usuário são obrigatórios.' });
        }

        try {
            const availabilitySlot = await prisma.availabilitySlot.findUnique({
                where: { id: slotId },
                include: { service: true, provider: true },
            });

            if (!availabilitySlot) {
                return res.status(404).json({ error: 'Slot de disponibilidade não encontrado.' });
            }

            if (availabilitySlot.status !== SlotStatus.OPEN) {
                return res.status(409).json({ error: 'Este horário já está reservado ou não disponível.' });
            }
            
            // Check if the user trying to book exists
            const client = await prisma.user.findUnique({ where: { id: userId, role: Role.CLIENT } });
            if (!client) {
                return res.status(404).json({ error: 'Cliente não encontrado.' });
            }

            // Create the Booking
            const newBooking = await prisma.booking.create({
                data: {
                    userId: userId,
                    slotId: slotId,
                    status: BookingStatus.CONFIRMED,
                },
            });

            // Update the AvailabilitySlot status
            await prisma.availabilitySlot.update({
                where: { id: slotId },
                data: {
                    status: SlotStatus.BOOKED,
                    userId: userId, // Assign client to the slot
                },
            });

            return res.status(201).json(newBooking);

        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            // P2002 is for unique constraint violation
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Este slot já possui um agendamento.' });
            }
            return res.status(500).json({ error: 'Erro interno do servidor ao criar agendamento.' });
        }
    }

    // READ (Listar todos os agendamentos)
    async getAll(req, res) {
        const { userId, role } = req.user;
        const { status, clientId, providerId } = req.query; // Filters
        
        let whereClause = {};

        // Filtering based on role
        if (role === Role.CLIENT) {
            whereClause.userId = userId;
        } else if (role === Role.PROVIDER) {
            const provider = await prisma.provider.findUnique({ where: { ownerId: userId } });
            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado.' });
            }
            whereClause.slot = { providerId: provider.id };
        }
        // Admin can see all, no specific userId filter needed unless provided in query

        // Additional filters from query params
        if (status) {
            whereClause.status = status;
        }
        if (clientId) {
            whereClause.userId = clientId;
        }
        if (providerId) {
            whereClause.slot = { ...whereClause.slot, providerId: providerId };
        }

        try {
            const bookings = await prisma.booking.findMany({
                where: whereClause,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    slot: {
                        include: {
                            service: true,
                            provider: { select: { id: true, name: true } },
                            staff: { select: { id: true, name: true } },
                        }
                    },
                },
                orderBy: { slot: { startAt: 'asc' } },
            });
            return res.status(200).json(bookings);
        } catch (error) {
            console.error('Erro ao listar agendamentos:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao listar agendamentos.' });
        }
    }

    // READ (Buscar agendamento por ID)
    async getById(req, res) {
        const { id } = req.params; // Booking ID
        const { userId, role } = req.user;

        try {
            const booking = await prisma.booking.findUnique({
                where: { id: id },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    slot: {
                        include: {
                            service: true,
                            provider: { select: { id: true, name: true } },
                            staff: { select: { id: true, name: true } },
                        }
                    },
                },
            });

            if (!booking) {
                return res.status(404).json({ error: 'Agendamento não encontrado.' });
            }

            // Authorization check
            if (role === Role.CLIENT && booking.userId !== userId) {
                return res.status(403).json({ error: 'Você não tem permissão para visualizar este agendamento.' });
            }
            if (role === Role.PROVIDER) {
                const provider = await prisma.provider.findUnique({ where: { ownerId: userId } });
                if (!provider || booking.slot.providerId !== provider.id) {
                    return res.status(403).json({ error: 'Você não tem permissão para visualizar este agendamento.' });
                }
            }
            
            return res.status(200).json(booking);
        } catch (error) {
            console.error('Erro ao buscar agendamento:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao buscar agendamento.' });
        }
    }

    // UPDATE (Update Booking Status or other details)
    async update(req, res) {
        const { id } = req.params; // Booking ID
        const { status, cancelToken, newSlotId } = req.body;
        const { userId, role } = req.user;

        try {
            const existingBooking = await prisma.booking.findUnique({
                where: { id: id },
                include: { slot: true },
            });

            if (!existingBooking) {
                return res.status(404).json({ error: 'Agendamento não encontrado para atualizar.' });
            }

            // Authorization check: Only ADMIN/PROVIDER or the client who owns the booking
            if (role === Role.CLIENT && existingBooking.userId !== userId) {
                return res.status(403).json({ error: 'Você não tem permissão para atualizar este agendamento.' });
            }
            if (role === Role.PROVIDER) {
                const provider = await prisma.provider.findUnique({ where: { ownerId: userId } });
                if (!provider || existingBooking.slot.providerId !== provider.id) {
                    return res.status(403).json({ error: 'Você não tem permissão para atualizar este agendamento.' });
                }
            }

            // Status update logic
            let updateData = {};
            if (status) {
                // Only allow specific status transitions or roles
                if (status === BookingStatus.CANCELLED) {
                    // Anyone authorized can cancel
                    updateData.status = BookingStatus.CANCELLED;
                    // Free up the slot
                    await prisma.availabilitySlot.update({
                        where: { id: existingBooking.slotId },
                        data: { status: SlotStatus.OPEN, userId: null },
                    });
                } else if (status === BookingStatus.CONFIRMED && role !== Role.CLIENT) {
                    // Providers/Admins can confirm (if a pending status were introduced)
                    updateData.status = BookingStatus.CONFIRMED;
                    await prisma.availabilitySlot.update({
                        where: { id: existingBooking.slotId },
                        data: { status: SlotStatus.BOOKED },
                    });
                } else {
                    return res.status(400).json({ error: 'Status de agendamento inválido ou você não tem permissão para esta ação.' });
                }
            }

            // Implement rescheduling by changing slotId if newSlotId is provided
            if (newSlotId) {
                // Basic authorization check for rescheduling (similar to status update)
                if (role === Role.CLIENT && existingBooking.userId !== userId) {
                    return res.status(403).json({ error: 'Você não tem permissão para reagendar este agendamento.' });
                }
                if (role === Role.PROVIDER) {
                    const provider = await prisma.provider.findUnique({ where: { ownerId: userId } });
                    if (!provider || existingBooking.slot.providerId !== provider.id) {
                        return res.status(403).json({ error: 'Você não tem permissão para reagendar este agendamento.' });
                    }
                }

                const newAvailabilitySlot = await prisma.availabilitySlot.findUnique({
                    where: { id: newSlotId },
                    include: { service: true },
                });

                if (!newAvailabilitySlot) {
                    return res.status(404).json({ error: 'Novo slot de disponibilidade não encontrado.' });
                }
                if (newAvailabilitySlot.status !== SlotStatus.OPEN) {
                    return res.status(409).json({ error: 'O novo horário já está reservado ou não disponível.' });
                }
                // Also check if the service matches or if provider allows changing service on reschedule
                if (newAvailabilitySlot.serviceId !== existingBooking.slot.serviceId) {
                    return res.status(400).json({ error: 'O novo slot deve ser para o mesmo tipo de serviço.' });
                }

                // Free up old slot
                await prisma.availabilitySlot.update({
                    where: { id: existingBooking.slotId },
                    data: { status: SlotStatus.OPEN, userId: null },
                });

                // Update booking with new slot
                updateData.slotId = newSlotId;
                // Book new slot
                await prisma.availabilitySlot.update({
                    where: { id: newSlotId },
                    data: { status: SlotStatus.BOOKED, userId: existingBooking.userId },
                });
            }

            const updatedBooking = await prisma.booking.update({
                where: { id: id },
                data: updateData,
            });

            return res.status(200).json(updatedBooking);

        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Agendamento não encontrado para atualizar.' });
            }
            if (error.code === 'P2002') { // Unique constraint failed for newSlotId.bookingId
                return res.status(409).json({ error: 'O novo slot já está vinculado a outro agendamento.' });
            }
            return res.status(500).json({ error: 'Erro interno do servidor ao atualizar agendamento.' });
        }
    }

    // DELETE (Cancel Booking)
    async delete(req, res) {
        const { id } = req.params; // Booking ID
        const { userId, role } = req.user;

        try {
            const existingBooking = await prisma.booking.findUnique({
                where: { id: id },
                include: { slot: true },
            });

            if (!existingBooking) {
                return res.status(404).json({ error: 'Agendamento não encontrado para exclusão.' });
            }

            // Authorization check: Only ADMIN/PROVIDER or the client who owns the booking
            if (role === Role.CLIENT && existingBooking.userId !== userId) {
                return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento.' });
            }
            if (role === Role.PROVIDER) {
                const provider = await prisma.provider.findUnique({ where: { ownerId: userId } });
                if (!provider || existingBooking.slot.providerId !== provider.id) {
                    return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento.' });
                }
            }

            // Free up the associated AvailabilitySlot
            await prisma.availabilitySlot.update({
                where: { id: existingBooking.slotId },
                data: { status: SlotStatus.OPEN, userId: null }, // Keep original userId who created the slot
            });

            await prisma.booking.delete({
                where: { id: id },
            });
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar agendamento:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Agendamento não encontrado para exclusão.' });
            }
            return res.status(500).json({ error: 'Erro interno do servidor ao deletar agendamento.' });
        }
    }
}

export const appointmentController = new AppointmentController();