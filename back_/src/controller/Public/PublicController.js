import  {prisma}  from '../../config/prismaClient.js';

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
            return res.status(200).json(services);
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

        if (!date) {
            return res.status(400).json({ error: 'O parâmetro "date" é obrigatório.' });
        }

        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const slots = await prisma.availabilitySlot.findMany({
                where: {
                    serviceId: serviceId,
                    status: 'OPEN',
                    startAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                orderBy: {
                    startAt: 'asc',
                },
                include: {
                    staff: {
                        select: {
                            name: true,
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
}

export const publicController = new PublicController();