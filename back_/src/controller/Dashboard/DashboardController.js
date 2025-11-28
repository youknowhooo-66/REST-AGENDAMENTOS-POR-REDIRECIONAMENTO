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

    getProviderStats = async (req, res) => {
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

            // Bookings by Period (e.g., last 7 days)
            const bookingsByPeriod = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);

                const count = await prisma.booking.count({
                    where: {
                        slot: {
                            providerId: providerId,
                            startAt: { gte: start, lte: end },
                        },
                        status: BookingStatus.CONFIRMED,
                    },
                });

                bookingsByPeriod.push({
                    date: date.toISOString().split('T')[0], // YYYY-MM-DD
                    bookings: count,
                });
            }


            res.status(200).json({
                totalServices,
                totalStaff,
                totalOpenSlots,
                totalConfirmedBookings,
                bookingsToday,
                bookingsByService: chartData,
                bookingsByPeriod: bookingsByPeriod,
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard do provedor:', error);
            res.status(500).json({ error: 'Erro interno do servidor ao buscar estatísticas do dashboard.' });
        }
    }

    getUpcomingAppointments = async (req, res) => {
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem acessar agendamentos futuros.' });
        }

        try {
            const providerId = await this.getProviderId(userId);
            if (!providerId) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const now = new Date();

            const upcomingAppointments = await prisma.booking.findMany({
                where: {
                    slot: {
                        providerId: providerId,
                        startAt: {
                            gte: now,
                        },
                    },
                    status: BookingStatus.CONFIRMED,
                },
                orderBy: {
                    slot: {
                        startAt: 'asc',
                    },
                },
                select: {
                    id: true,
                    status: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    slot: {
                        select: {
                            startAt: true,
                            endAt: true,
                            service: {
                                select: {
                                    name: true,
                                },
                            },
                            staff: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
                take: 5, // Limit to 5 upcoming appointments for the dashboard view
            });

            return res.status(200).json(upcomingAppointments);

        } catch (error) {
            console.error('Erro ao buscar próximos agendamentos:', error);
            res.status(500).json({ error: 'Erro interno do servidor ao buscar próximos agendamentos.' });
        }
    }
}

export const dashboardController = new DashboardController();