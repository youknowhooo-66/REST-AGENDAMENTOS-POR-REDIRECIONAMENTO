// ==============================================
// TESTES UNITÁRIOS - BOOKING SERVICE
// ==============================================

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { bookingService } from '../services/businessServices.js';
import { prisma } from '../config/prismaClient.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import pkg from '@prisma/client';
const { BookingStatus, SlotStatus } = pkg;

// Mock do Prisma Client
jest.mock('../config/prismaClient.js', () => ({
    prisma: {
        availabilitySlot: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        booking: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(prisma)),
    },
}));

describe('BookingService', () => {
    beforeEach(() => {
        // Limpar todos os mocks antes de cada teste
        jest.clearAllMocks();
    });

    describe('validateSlot', () => {
        it('deve retornar slot quando válido', async () => {
            const mockSlot = {
                id: 'slot-123',
                startAt: new Date(Date.now() + 86400000), // Amanhã
                status: SlotStatus.AVAILABLE,
                service: {
                    id: 'service-123',
                    name: 'Corte de Cabelo',
                },
            };

            prisma.availabilitySlot.findUnique.mockResolvedValue(mockSlot);

            const result = await bookingService.validateSlot('slot-123');

            expect(result).toEqual(mockSlot);
            expect(prisma.availabilitySlot.findUnique).toHaveBeenCalledWith({
                where: { id: 'slot-123' },
                include: {
                    service: {
                        include: {
                            provider: true,
                        },
                    },
                },
            });
        });

        it('deve lançar NotFoundError quando slot não existe', async () => {
            prisma.availabilitySlot.findUnique.mockResolvedValue(null);

            await expect(bookingService.validateSlot('invalid-id')).rejects.toThrow(
                NotFoundError
            );
            await expect(bookingService.validateSlot('invalid-id')).rejects.toThrow(
                'Slot não encontrado'
            );
        });

        it('deve lançar ValidationError quando slot não está disponível', async () => {
            const mockSlot = {
                id: 'slot-123',
                startAt: new Date(Date.now() + 86400000),
                status: SlotStatus.BOOKED,
                service: {},
            };

            prisma.availabilitySlot.findUnique.mockResolvedValue(mockSlot);

            await expect(bookingService.validateSlot('slot-123')).rejects.toThrow(
                ValidationError
            );
            await expect(bookingService.validateSlot('slot-123')).rejects.toThrow(
                'Este horário não está mais disponível'
            );
        });

        it('deve lançar ValidationError quando slot está no passado', async () => {
            const mockSlot = {
                id: 'slot-123',
                startAt: new Date(Date.now() - 86400000), // Ontem
                status: SlotStatus.AVAILABLE,
                service: {},
            };

            prisma.availabilitySlot.findUnique.mockResolvedValue(mockSlot);

            await expect(bookingService.validateSlot('slot-123')).rejects.toThrow(
                ValidationError
            );
            await expect(bookingService.validateSlot('slot-123')).rejects.toThrow(
                'Não é possível agendar horários no passado'
            );
        });
    });

    describe('validateUser', () => {
        it('deve retornar usuário quando válido', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                name: 'John Doe',
                phone: '+5511999999999',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await bookingService.validateUser('user-123');

            expect(result).toEqual(mockUser);
        });

        it('deve lançar NotFoundError quando usuário não existe', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(bookingService.validateUser('invalid-id')).rejects.toThrow(
                NotFoundError
            );
        });

        it('deve lançar ValidationError quando usuário não completou perfil', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                name: null,
                phone: null,
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(bookingService.validateUser('user-123')).rejects.toThrow(
                ValidationError
            );
            await expect(bookingService.validateUser('user-123')).rejects.toThrow(
                'Complete seu perfil antes de fazer um agendamento'
            );
        });
    });

    describe('checkUserAvailability', () => {
        it('não deve lançar erro quando usuário está disponível', async () => {
            prisma.booking.findFirst.mockResolvedValue(null);

            await expect(
                bookingService.checkUserAvailability('user-123', new Date())
            ).resolves.not.toThrow();
        });

        it('deve lançar ValidationError quando usuário já tem booking no horário', async () => {
            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                status: BookingStatus.PENDING,
            };

            prisma.booking.findFirst.mockResolvedValue(mockBooking);

            await expect(
                bookingService.checkUserAvailability('user-123', new Date())
            ).rejects.toThrow(ValidationError);
            await expect(
                bookingService.checkUserAvailability('user-123', new Date())
            ).rejects.toThrow('Você já tem um agendamento neste horário');
        });
    });

    describe('createBooking', () => {
        it('deve criar booking com sucesso', async () => {
            const mockSlot = {
                id: 'slot-123',
                startAt: new Date(Date.now() + 86400000),
                status: SlotStatus.AVAILABLE,
                service: {
                    id: 'service-123',
                    name: 'Corte de Cabelo',
                    provider: {},
                },
            };

            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                name: 'John Doe',
                phone: '+5511999999999',
            };

            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                slotId: 'slot-123',
                status: BookingStatus.PENDING,
                slot: mockSlot,
                user: mockUser,
            };

            // Mock das funções de validação
            jest.spyOn(bookingService, 'validateSlot').mockResolvedValue(mockSlot);
            jest.spyOn(bookingService, 'validateUser').mockResolvedValue(mockUser);
            jest.spyOn(bookingService, 'checkUserAvailability').mockResolvedValue();
            jest.spyOn(bookingService, 'sendConfirmationEmailAsync').mockResolvedValue();

            prisma.$transaction.mockImplementation(async (callback) => {
                return mockBooking;
            });

            const result = await bookingService.createBooking('user-123', 'slot-123');

            expect(result).toEqual(mockBooking);
            expect(bookingService.validateSlot).toHaveBeenCalledWith('slot-123');
            expect(bookingService.validateUser).toHaveBeenCalledWith('user-123');
        });
    });

    describe('cancelBooking', () => {
        it('deve cancelar booking com sucesso', async () => {
            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                slotId: 'slot-123',
                status: BookingStatus.PENDING,
                slot: {
                    id: 'slot-123',
                    startAt: new Date(Date.now() + 86400000),
                    service: {},
                },
                user: {
                    id: 'user-123',
                    name: 'John Doe',
                    email: 'user@example.com',
                },
            };

            const updatedBooking = {
                ...mockBooking,
                status: BookingStatus.CANCELLED,
                cancelledAt: new Date(),
            };

            jest.spyOn(bookingService, 'findBookingById').mockResolvedValue(mockBooking);

            prisma.$transaction.mockImplementation(async (callback) => {
                return updatedBooking;
            });

            const result = await bookingService.cancelBooking(
                'booking-123',
                'user-123',
                'CLIENT'
            );

            expect(result.status).toBe(BookingStatus.CANCELLED);
        });

        it('deve lançar ValidationError quando booking já foi cancelado', async () => {
            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                status: BookingStatus.CANCELLED,
                slot: {
                    startAt: new Date(Date.now() + 86400000),
                },
            };

            jest.spyOn(bookingService, 'findBookingById').mockResolvedValue(mockBooking);

            await expect(
                bookingService.cancelBooking('booking-123', 'user-123', 'CLIENT')
            ).rejects.toThrow('Este agendamento já foi cancelado');
        });

        it('deve lançar ValidationError quando usuário não tem permissão', async () => {
            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                status: BookingStatus.PENDING,
                slot: {
                    startAt: new Date(Date.now() + 86400000),
                },
            };

            jest.spyOn(bookingService, 'findBookingById').mockResolvedValue(mockBooking);

            await expect(
                bookingService.cancelBooking('booking-123', 'other-user', 'CLIENT')
            ).rejects.toThrow('Você não tem permissão para cancelar este agendamento');
        });

        it('deve lançar ValidationError quando tentar cancelar booking passado', async () => {
            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                status: BookingStatus.PENDING,
                slot: {
                    startAt: new Date(Date.now() - 86400000), // Ontem
                },
            };

            jest.spyOn(bookingService, 'findBookingById').mockResolvedValue(mockBooking);

            await expect(
                bookingService.cancelBooking('booking-123', 'user-123', 'CLIENT')
            ).rejects.toThrow('Não é possível cancelar agendamentos passados');
        });
    });

    describe('getClientBookings', () => {
        it('deve retornar bookings paginados do cliente', async () => {
            const mockBookings = [
                {
                    id: 'booking-1',
                    userId: 'user-123',
                    status: BookingStatus.PENDING,
                    slot: {
                        service: {
                            name: 'Serviço 1',
                        },
                    },
                },
                {
                    id: 'booking-2',
                    userId: 'user-123',
                    status: BookingStatus.CONFIRMED,
                    slot: {
                        service: {
                            name: 'Serviço 2',
                        },
                    },
                },
            ];

            prisma.booking.findMany.mockResolvedValue(mockBookings);
            prisma.booking.count.mockResolvedValue(2);

            const result = await bookingService.getClientBookings('user-123', {
                page: 1,
                limit: 10,
            });

            expect(result.data).toEqual(mockBookings);
            expect(result.meta).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            });
        });

        it('deve filtrar bookings por status', async () => {
            const mockBookings = [
                {
                    id: 'booking-1',
                    userId: 'user-123',
                    status: BookingStatus.PENDING,
                },
            ];

            prisma.booking.findMany.mockResolvedValue(mockBookings);
            prisma.booking.count.mockResolvedValue(1);

            await bookingService.getClientBookings('user-123', {
                status: BookingStatus.PENDING,
            });

            expect(prisma.booking.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: BookingStatus.PENDING,
                    }),
                })
            );
        });
    });
});

// ==============================================
// TESTES DE EDGE CASES
// ==============================================

describe('BookingService - Edge Cases', () => {
    it('deve lidar com erro de conexão com banco de dados', async () => {
        prisma.availabilitySlot.findUnique.mockRejectedValue(
            new Error('Database connection error')
        );

        await expect(bookingService.validateSlot('slot-123')).rejects.toThrow(
            'Database connection error'
        );
    });

    it('deve lidar com timeout de transação', async () => {
        prisma.$transaction.mockRejectedValue(new Error('Transaction timeout'));

        jest.spyOn(bookingService, 'validateSlot').mockResolvedValue({
            id: 'slot-123',
            status: SlotStatus.AVAILABLE,
            startAt: new Date(Date.now() + 86400000),
        });

        jest.spyOn(bookingService, 'validateUser').mockResolvedValue({
            id: 'user-123',
            name: 'John Doe',
            phone: '+5511999999999',
        });

        jest.spyOn(bookingService, 'checkUserAvailability').mockResolvedValue();

        await expect(bookingService.createBooking('user-123', 'slot-123')).rejects.toThrow(
            'Transaction timeout'
        );
    });

    it('deve lidar com múltiplas tentativas simultâneas de booking do mesmo slot', async () => {
        // Este teste simula race condition
        const mockSlot = {
            id: 'slot-123',
            startAt: new Date(Date.now() + 86400000),
            status: SlotStatus.AVAILABLE,
        };

        jest.spyOn(bookingService, 'validateSlot')
            .mockResolvedValueOnce(mockSlot)
            .mockRejectedValueOnce(
                new ValidationError('Este horário não está mais disponível')
            );

        const user = {
            id: 'user-123',
            name: 'John Doe',
            phone: '+5511999999999',
        };

        jest.spyOn(bookingService, 'validateUser').mockResolvedValue(user);
        jest.spyOn(bookingService, 'checkUserAvailability').mockResolvedValue();

        // Primeira tentativa deve funcionar
        const mockBooking = {
            id: 'booking-123',
            userId: 'user-123',
            slotId: 'slot-123',
            status: BookingStatus.PENDING,
        };

        prisma.$transaction.mockResolvedValueOnce(mockBooking);

        await expect(bookingService.createBooking('user-123', 'slot-123')).resolves.toEqual(
            mockBooking
        );

        // Segunda tentativa (simultânea) deve falhar
        await expect(bookingService.createBooking('user-456', 'slot-123')).rejects.toThrow(
            'Este horário não está mais disponível'
        );
    });
});
