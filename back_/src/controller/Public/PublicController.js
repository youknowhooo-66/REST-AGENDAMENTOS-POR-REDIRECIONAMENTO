import { prisma } from '../../config/prismaClient.js';

class PublicController {

    // GET ALL SERVICES (Public)
    async getAllServices(req, res) {
        try {
            const services = await prisma.service.findMany({
                include: {
                    provider: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    provider: {
                        name: 'asc',
                    },
                },
            });

            // Converter images JSON para array se necessário
            const servicesWithParsedImages = services.map(service => {
                if (service.images && typeof service.images === 'string') {
                    try {
                        service.images = JSON.parse(service.images);
                    } catch (e) {
                        service.images = null;
                    }
                }
                return service;
            });

            return res.status(200).json(servicesWithParsedImages);
        } catch (error) {
            console.error('Erro ao listar serviços públicos:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // GET SERVICE BY ID (Public)
    async getServiceById(req, res) {
        const { id } = req.params;
        try {
            const service = await prisma.service.findUnique({
                where: { id: id },
                include: {
                    provider: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            if (!service) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }

            // Converter images JSON para array se necessário
            if (service.images && typeof service.images === 'string') {
                try {
                    service.images = JSON.parse(service.images);
                } catch (e) {
                    service.images = null;
                }
            }

            return res.status(200).json(service);
        } catch (error) {
            console.error('Erro ao buscar serviço público por ID:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // GET AVAILABLE SLOTS FOR A SERVICE (Public)
    async getAvailableSlots(req, res) {
        const { serviceId } = req.params;
        const { date } = req.query; // e.g., ?date=2023-12-25

        try {
            const now = new Date();
            let startAtFilter = {};

            if (date) {
                // Parse da data de forma segura (evita problemas de timezone)
                const [year, month, day] = date.split('-').map(Number);
                const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0); // Local time
                const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999); // Local time

                const minStartTime = now > startOfDay ? now : startOfDay;

                startAtFilter = {
                    gte: minStartTime,
                    lte: endOfDay,
                };
            } else {
                // Se não houver data, retornar todos os slots futuros
                startAtFilter = {
                    gte: now,
                };
            }

            const slots = await prisma.availabilitySlot.findMany({
                where: {
                    serviceId: serviceId,
                    status: 'OPEN', // SlotStatus.OPEN
                    userId: null, // Only return slots not associated with any user
                    startAt: startAtFilter,
                },
                orderBy: {
                    startAt: 'asc',
                },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            images: true,
                            durationMin: true,
                            priceCents: true,
                        },
                    },
                },
            });
            return res.status(200).json(slots);
        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // GET STAFF BY SERVICE (Public) - Retorna funcionários que têm slots disponíveis para um serviço
    async getStaffByService(req, res) {
        const { serviceId } = req.params;

        try {
            // Buscar slots disponíveis para o serviço e agrupar por staff
            const slots = await prisma.availabilitySlot.findMany({
                where: {
                    serviceId: serviceId,
                    status: 'OPEN',
                    startAt: {
                        gte: new Date(), // Apenas slots futuros
                    },
                },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                },
                distinct: ['staffId'], // Garantir funcionários únicos
            });

            // Extrair funcionários únicos
            const staffMap = new Map();
            slots.forEach(slot => {
                if (slot.staff && !staffMap.has(slot.staff.id)) {
                    staffMap.set(slot.staff.id, slot.staff);
                }
            });

            const staffList = Array.from(staffMap.values());
            return res.status(200).json(staffList);
        } catch (error) {
            console.error('Erro ao buscar funcionários do serviço:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // GET SLOTS BY STAFF (Public) - Retorna slots disponíveis para um funcionário em uma data
    async getSlotsByStaff(req, res) {
        const { staffId } = req.params;
        const { date } = req.query;

        try {
            const now = new Date();
            let startAtFilter = {};

            if (date) {
                const [year, month, day] = date.split('-').map(Number);
                const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
                const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
                const minStartTime = now > startOfDay ? now : startOfDay;
                startAtFilter = {
                    gte: minStartTime,
                    lte: endOfDay,
                };
            } else {
                startAtFilter = {
                    gte: now,
                };
            }

            const slots = await prisma.availabilitySlot.findMany({
                where: {
                    staffId: staffId,
                    status: 'OPEN',
                    userId: null, // Only return slots not associated with any user
                    startAt: startAtFilter,
                },
                orderBy: {
                    startAt: 'asc',
                },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            images: true,
                            durationMin: true,
                            priceCents: true,
                        },
                    },
                },
            });
            return res.status(200).json(slots);
        } catch (error) {
            console.error('Erro ao buscar horários do funcionário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}

export const publicController = new PublicController();