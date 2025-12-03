import { prisma } from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { Role, SlotStatus } = pkg;

class AvailabilitySlotController {

    constructor() {
        this.create = this.create.bind(this);
        this.createBulk = this.createBulk.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    // Helper to get provider ID for authenticated user
    async getProviderId(userId) {
        const provider = await prisma.provider.findFirst({
            where: { ownerId: userId },
        });
        return provider ? provider.id : null;
    }

    // CREATE: Create a single availability slot
    async create(req, res) {
        const { serviceId, staffId, startAt, endAt } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem criar horários de disponibilidade.' });
        }

        if (!serviceId || !startAt || !endAt) {
            return res.status(400).json({ error: 'ID do serviço, hora de início e hora de término são obrigatórios.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const parsedStartAt = new Date(startAt);
            const parsedEndAt = new Date(endAt);

            if (parsedStartAt >= parsedEndAt) {
                return res.status(400).json({ error: 'A hora de início deve ser anterior à hora de término.' });
            }

            // Validate service belongs to provider
            const service = await prisma.service.findUnique({
                where: { id: serviceId, providerId: providerId },
            });
            if (!service) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }

            // Validate staff belongs to provider (if staffId is provided)
            if (staffId) {
                const staff = await prisma.staff.findUnique({
                    where: { id: staffId, providerId: providerId },
                });
                if (!staff) {
                    return res.status(404).json({ error: 'Funcionário não encontrado ou não pertence a este provedor.' });
                }
            }

            // Check for overlapping slots for the same provider and startAt
            const existingSlot = await prisma.availabilitySlot.findFirst({
                where: {
                    providerId: providerId,
                    startAt: parsedStartAt,
                    // Consider adding more robust overlap checking if slots can have different durations
                    // For now, unique constraint on [providerId, startAt] handles exact duplicates
                },
            });

            if (existingSlot) {
                return res.status(409).json({ error: 'Já existe um horário de disponibilidade começando neste exato momento para este provedor.' });
            }

            const newSlot = await prisma.availabilitySlot.create({
                data: {
                    providerId: providerId,
                    serviceId: serviceId,
                    staffId: staffId || null,
                    startAt: parsedStartAt,
                    endAt: parsedEndAt,
                    status: SlotStatus.OPEN,
                    userId: userId,
                },
            });
            return res.status(201).json(newSlot);
        } catch (error) {
            console.error('Erro ao criar horário de disponibilidade:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar horário de disponibilidade.' });
        }
    }

    // CREATE BULK: Create multiple availability slots at once
    async createBulk(req, res) {
        const { serviceId, staffId, startDate, endDate, daysOfWeek, timeSlots } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem criar horários de disponibilidade.' });
        }

        if (!serviceId || !startDate || !endDate || !daysOfWeek || !timeSlots || timeSlots.length === 0) {
            return res.status(400).json({
                error: 'ID do serviço, data inicial, data final, dias da semana e horários são obrigatórios.'
            });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            // Validate service belongs to provider
            const service = await prisma.service.findUnique({
                where: { id: serviceId, providerId: providerId },
            });
            if (!service) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }

            // Validate staff belongs to provider (if staffId is provided)
            if (staffId) {
                const staff = await prisma.staff.findUnique({
                    where: { id: staffId, providerId: providerId },
                });
                if (!staff) {
                    return res.status(404).json({ error: 'Funcionário não encontrado ou não pertence a este provedor.' });
                }
            }

            // Generate slots
            const slotsToCreate = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

                if (daysOfWeek.includes(dayOfWeek)) {
                    for (const timeSlot of timeSlots) {
                        const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
                        const [endHour, endMinute] = timeSlot.end.split(':').map(Number);

                        const slotStart = new Date(date);
                        slotStart.setHours(startHour, startMinute, 0, 0);

                        const slotEnd = new Date(date);
                        slotEnd.setHours(endHour, endMinute, 0, 0);

                        if (slotStart >= slotEnd) {
                            continue; // Skip invalid time slots
                        }

                        slotsToCreate.push({
                            providerId,
                            serviceId,
                            staffId: staffId || null,
                            startAt: slotStart,
                            endAt: slotEnd,
                            status: SlotStatus.OPEN,
                            userId: userId,
                        });
                    }
                }
            }

            if (slotsToCreate.length === 0) {
                return res.status(400).json({ error: 'Nenhum horário válido foi gerado com os parâmetros fornecidos.' });
            }

            // Create all slots using createMany (skips duplicates due to unique constraint)
            const result = await prisma.availabilitySlot.createMany({
                data: slotsToCreate,
                skipDuplicates: true, // Skip slots that conflict with unique constraint
            });

            return res.status(201).json({
                message: `${result.count} horários criados com sucesso.`,
                count: result.count
            });
        } catch (error) {
            console.error('Erro ao criar horários em lote:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar horários em lote.' });
        }
    }

    // GET ALL: List all availability slots for the authenticated provider
    async getAll(req, res) {
        const { userId, role } = req.user;
        const { staffId, serviceId, startDate, endDate, status } = req.query;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem listar horários de disponibilidade.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            let whereClause = { providerId: providerId };

            if (staffId) whereClause.staffId = staffId;
            if (serviceId) whereClause.serviceId = serviceId;
            if (status && Object.values(SlotStatus).includes(status.toUpperCase())) {
                whereClause.status = status.toUpperCase();
            }
            if (startDate || endDate) {
                whereClause.startAt = {};
                if (startDate) whereClause.startAt.gte = new Date(startDate);
                if (endDate) whereClause.startAt.lte = new Date(endDate);
            }

            const slots = await prisma.availabilitySlot.findMany({
                where: whereClause,
                orderBy: { startAt: 'asc' },
                include: { service: true, staff: true },
            });
            return res.status(200).json(slots);
        } catch (error) {
            console.error('Erro ao listar horários de disponibilidade:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao listar horários de disponibilidade.' });
        }
    }

    // GET BY ID: Get a single availability slot by ID
    async getById(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem visualizar horários de disponibilidade.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const slot = await prisma.availabilitySlot.findUnique({
                where: { id: id, providerId: providerId },
                include: { service: true, staff: true },
            });

            if (!slot) {
                return res.status(404).json({ error: 'Horário de disponibilidade não encontrado ou não pertence a este provedor.' });
            }
            return res.status(200).json(slot);
        } catch (error) {
            console.error('Erro ao buscar horário de disponibilidade:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao buscar horário de disponibilidade.' });
        }
    }

    // UPDATE: Update an availability slot
    async update(req, res) {
        const { id } = req.params;
        const { serviceId, staffId, startAt, endAt, status } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem atualizar horários de disponibilidade.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const existingSlot = await prisma.availabilitySlot.findUnique({
                where: { id: id, providerId: providerId },
            });

            if (!existingSlot) {
                return res.status(404).json({ error: 'Horário de disponibilidade não encontrado ou não pertence a este provedor.' });
            }

            // Prevent updating status to BOOKED directly
            if (status && status.toUpperCase() === SlotStatus.BOOKED && existingSlot.status !== SlotStatus.BOOKED) {
                return res.status(400).json({ error: 'Não é possível alterar o status para BOOKED diretamente. Use a API de agendamento.' });
            }

            let updateData = {};
            if (serviceId) {
                const service = await prisma.service.findUnique({ where: { id: serviceId, providerId: providerId } });
                if (!service) return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
                updateData.serviceId = serviceId;
            }
            if (staffId) {
                const staff = await prisma.staff.findUnique({ where: { id: staffId, providerId: providerId } });
                if (!staff) return res.status(404).json({ error: 'Funcionário não encontrado ou não pertence a este provedor.' });
                updateData.staffId = staffId;
            }
            if (startAt) updateData.startAt = new Date(startAt);
            if (endAt) updateData.endAt = new Date(endAt);
            if (status && Object.values(SlotStatus).includes(status.toUpperCase())) {
                updateData.status = status.toUpperCase();
            }

            // Re-validate startAt and endAt if they are being updated
            if (updateData.startAt && updateData.endAt && updateData.startAt >= updateData.endAt) {
                return res.status(400).json({ error: 'A hora de início deve ser anterior à hora de término.' });
            }

            // Check for overlaps if startAt or endAt are changed
            if (updateData.startAt && updateData.startAt !== existingSlot.startAt) {
                const conflict = await prisma.availabilitySlot.findFirst({
                    where: {
                        providerId: providerId,
                        startAt: updateData.startAt,
                        id: { not: id }, // Exclude current slot from conflict check
                    },
                });
                if (conflict) {
                    return res.status(409).json({ error: 'Já existe um horário de disponibilidade começando neste exato momento para este provedor.' });
                }
            }


            const updatedSlot = await prisma.availabilitySlot.update({
                where: { id: id, providerId: providerId },
                data: updateData,
            });
            return res.status(200).json(updatedSlot);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Horário de disponibilidade não encontrado para atualizar.' });
            }
            console.error('Erro ao atualizar horário de disponibilidade:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao atualizar horário de disponibilidade.' });
        }
    }

    // DELETE: Delete an availability slot
    async delete(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem deletar horários de disponibilidade.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const existingSlot = await prisma.availabilitySlot.findUnique({
                where: { id: id, providerId: providerId },
            });

            if (!existingSlot) {
                return res.status(404).json({ error: 'Horário de disponibilidade não encontrado ou não pertence a este provedor.' });
            }

            if (existingSlot.status === SlotStatus.BOOKED) {
                return res.status(400).json({ error: 'Não é possível deletar um horário já agendado. Cancele o agendamento primeiro.' });
            }

            await prisma.availabilitySlot.delete({
                where: { id: id, providerId: providerId },
            });
            return res.status(204).send();
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Horário de disponibilidade não encontrado para exclusão.' });
            }
            console.error('Erro ao deletar horário de disponibilidade:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao deletar horário de disponibilidade.' });
        }
    }
}

export const availabilitySlotController = new AvailabilitySlotController();