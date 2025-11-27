import  {prisma}  from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { Role, SlotStatus, BookingStatus } = pkg;

class DashboardController {

    // Helper to get provider ID for authenticated user
    async getProviderId(userId) {
        const provider = await prisma.provider.findFirst({
            where: { ownerId: userId },
        });
        return provider ? provider.id : null;
    }

    async getProviderStats(req, res) {
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem acessar estatísticas do dashboard.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            // Total Services
            const totalServices = await prisma.service.count({
                where: { providerId: providerId },
            });

            // Total Staff
            const totalStaff = await prisma.staff.count({
                where: { providerId: providerId },
            });

            // Total Open Slots
            const totalOpenSlots = await prisma.availabilitySlot.count({
                where: { providerId: providerId, status: SlotStatus.OPEN },
            });

            // Total Bookings (Confirmed)
            const totalConfirmedBookings = await prisma.booking.count({
                where: {
                    slot: { providerId: providerId },
                    status: BookingStatus.CONFIRMED,
                },
            });

            // Bookings Today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const bookingsToday = await prisma.booking.count({
                where: {
                    slot: {
                        providerId: providerId,
                        startAt: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                    status: BookingStatus.CONFIRMED,
                },
            });

            // Bookings by Service (for chart)
            const confirmedBookingsWithService = await prisma.booking.findMany({
                where: {
                    slot: { providerId: providerId },
                    status: BookingStatus.CONFIRMED,
                },
                select: {
                    slot: {
                        select: {
                            service: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                }
            });

            const serviceCounts = confirmedBookingsWithService.reduce((acc, booking) => {
                const serviceName = booking.slot?.service?.name || 'Serviço Desconhecido';
                acc[serviceName] = (acc[serviceName] || 0) + 1;
                return acc;
            }, {});

            const chartData = Object.keys(serviceCounts).map(name => ({
                name: name,
                bookings: serviceCounts[name],
            }));


            res.status(200).json({
                totalServices,
                totalStaff,
                totalOpenSlots,
                totalConfirmedBookings,
                bookingsToday,
                bookingsByService: chartData,
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard do provedor:', error);
            res.status(500).json({ error: 'Erro interno do servidor ao buscar estatísticas do dashboard.' });
        }
    }
}

export const dashboardController = new DashboardController();