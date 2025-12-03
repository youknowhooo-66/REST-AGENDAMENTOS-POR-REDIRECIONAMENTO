import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prismaClient.js';
import { signAccessToken } from '../src/utils/jwt.js';
import bcrypt from 'bcrypt';
import pkg from '@prisma/client';
import * as emailService from '../src/services/emailService.js';

const { Role, SlotStatus } = pkg;

describe('Booking API [/api/bookings]', () => {
    let adminUser, adminToken;
    let clientUser, clientToken;
    let providerUser, providerToken, provider;
    let service;
    
    let openAvailabilitySlot;

    beforeAll(async () => {
        // Create an admin user
        const adminHashedPassword = await bcrypt.hash('adminpassword', 10);
        adminUser = await prisma.user.create({
            data: {
                name: 'Admin Booking',
                email: 'admin.booking@example.com',
                password: adminHashedPassword,
                role: Role.ADMIN,
            },
        });
        adminToken = signAccessToken({ userId: adminUser.id, role: adminUser.role });

        // Create a client user
        const clientHashedPassword = await bcrypt.hash('clientpassword', 10);
        clientUser = await prisma.user.create({
            data: {
                name: 'Client Booking Test',
                email: 'client.booking.test@example.com',
                password: clientHashedPassword,
                role: Role.CLIENT,
            },
        });
        clientToken = signAccessToken({ userId: clientUser.id, role: clientUser.role });

        // Create a provider user
        const providerHashedPassword = await bcrypt.hash('providerpassword', 10);
        providerUser = await prisma.user.create({
            data: {
                name: 'Provider Booking Test',
                email: 'provider.booking.test@example.com',
                password: providerHashedPassword,
                role: Role.PROVIDER,
            },
        });
        providerToken = signAccessToken({ userId: providerUser.id, role: providerUser.role });

        provider = await prisma.provider.create({
            data: {
                name: providerUser.name,
                ownerId: providerUser.id,
            },
        });

        service = await prisma.service.create({
            data: {
                name: 'Test Service for Booking',
                priceCents: 10000,
                durationMin: 60,
                providerId: provider.id,
            },
        });
    });

    beforeEach(() => {
        jest.spyOn(emailService, 'sendCancelEmail').mockResolvedValue(undefined);
    });

    afterEach(async () => {
        // Clean up bookings and availability slots after each test
        await prisma.booking.deleteMany();
        await prisma.availabilitySlot.deleteMany();
        jest.restoreAllMocks(); // Restore mocks
    });

    afterAll(async () => {
        // Clean up remaining data from beforeAll
        await prisma.token.deleteMany();
        await prisma.booking.deleteMany();
        await prisma.availabilitySlot.deleteMany();
        await prisma.service.deleteMany();
        await prisma.provider.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    // Helper to create a slot
    const createSlot = async () => {
        const now = new Date();
        const startAt = new Date(now.getTime() + Math.random() * 1000 * 60 * 60 * 24);
        const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);

        return await prisma.availabilitySlot.create({
            data: {
                providerId: provider.id,
                serviceId: service.id,
                userId: providerUser.id,
                startAt: startAt,
                endAt: endAt,
                status: SlotStatus.OPEN,
            },
        });
    };

    describe('POST /api/bookings', () => {
        it('should create a new booking for an available slot', async () => {
            openAvailabilitySlot = await createSlot();
            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('bookingId');
            
            const newBooking = await prisma.booking.findUnique({where: {id: res.body.bookingId}});
            expect(newBooking).toBeDefined();
            expect(newBooking.userId).toBe(clientUser.id);
            expect(newBooking.slotId).toBe(openAvailabilitySlot.id);

            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: openAvailabilitySlot.id } });
            expect(updatedSlot.status).toBe(SlotStatus.BOOKED);
            expect(emailService.sendCancelEmail).toHaveBeenCalledTimes(1);
        });

        it('should return 401 if user is not authenticated', async () => {
            openAvailabilitySlot = await createSlot();
            const res = await request(app)
                .post('/api/bookings')
                .send({ slotId: openAvailabilitySlot.id });
            
            expect(res.statusCode).toEqual(401);
        });

        it('should return 404 if slot does not exist', async () => {
            const nonExistentSlotId = 'clxxxxxxxxxxxxxxx'; // Invalid or non-existent slot ID
            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: nonExistentSlotId });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Slot de agendamento não encontrado.');
        });
        it('should return 409 if slot is already booked', async () => {
            openAvailabilitySlot = await createSlot();
            // Book it once
            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });
            
            // Try to book it again
            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message', 'Slot já reservado por outro usuário');
        });
    });

    describe('GET /api/bookings', () => {
        it('should return bookings for the authenticated client', async () => {
            openAvailabilitySlot = await createSlot();
            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });

            const res = await request(app)
                .get('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].userId).toBe(clientUser.id);
        });

        it('should return 403 if user is not a client', async () => {
            const res = await request(app)
                .get('/api/bookings')
                .set('Authorization', `Bearer ${providerToken}`);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Apenas clientes podem realizar esta ação.');
        });
    });

    describe('GET /api/bookings/provider', () => {
        it('should return bookings for the authenticated provider', async () => {
            openAvailabilitySlot = await createSlot();
            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });
            
            const res = await request(app)
                .get('/api/bookings/provider')
                .set('Authorization', `Bearer ${providerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].slot.providerId).toBe(provider.id);
        });

        it('should return 403 if user is not a provider', async () => {
            const res = await request(app)
                .get('/api/bookings/provider')
                .set('Authorization', `Bearer ${clientToken}`);
            
            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Apenas provedores podem realizar esta ação.');
        });
    });

    describe('POST /api/bookings/:bookingId/provider-cancel', () => {
        it('should allow a provider to cancel a booking for their service', async () => {
            openAvailabilitySlot = await createSlot();
            const bookingRes = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });

            const res = await request(app)
                .post(`/api/bookings/${bookingRes.body.bookingId}/provider-cancel`)
                .set('Authorization', `Bearer ${providerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('bookingId', bookingRes.body.bookingId);

            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: openAvailabilitySlot.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
        });

        it('should return 403 if user is not a provider', async () => {
             openAvailabilitySlot = await createSlot();
            const bookingRes = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });
            
            const res = await request(app)
                .post(`/api/bookings/${bookingRes.body.bookingId}/provider-cancel`)
                .set('Authorization', `Bearer ${clientToken}`);
            
            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Apenas provedores podem cancelar agendamentos.');
        });
    });

    describe('GET /api/bookings/cancel', () => {
        it('should allow a user to cancel their booking with a valid cancellation token', async () => {
            openAvailabilitySlot = await createSlot();
            const bookingRes = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ slotId: openAvailabilitySlot.id });

            const createdBooking = await prisma.booking.findUnique({ where: { id: bookingRes.body.bookingId }});
            const cancellationToken = createdBooking.cancelToken;
            
            const res = await request(app)
                .get(`/api/bookings/cancel?token=${cancellationToken}`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Agendamento cancelado com sucesso.');
        });

        it('should return 400 if cancellation token is missing', async () => {
            const res = await request(app)
                .get(`/api/bookings/cancel`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Token de cancelamento é obrigatório.');
        });

        it('should return 400 if cancellation token is invalid', async () => {
            const res = await request(app)
                .get(`/api/bookings/cancel?token=invalidtoken`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Token de cancelamento inválido ou expirado.');
        });
    });
});
