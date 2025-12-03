import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prismaClient.js';
import { signAccessToken } from '../src/utils/jwt.js';
import bcrypt from 'bcrypt';
import pkg from '@prisma/client';

const { Role, SlotStatus, BookingStatus } = pkg;

describe('Booking API', () => {
    let adminUser, adminToken;
    let clientUser, clientToken;
    let providerUser, providerToken, provider;
    let service;
    let openAvailabilitySlot;
    let bookedAvailabilitySlot; // For testing already booked scenarios

    beforeAll(async () => {
        // Create an admin user
        const adminHashedPassword = await bcrypt.hash('adminpassword', 10);
        adminUser = await prisma.user.create({
            data: {
                name: 'Admin Booking',
                email: 'admin.booking.appoint@example.com',
                password: adminHashedPassword,
                role: Role.ADMIN,
            },
        });
        adminToken = signAccessToken({ userId: adminUser.id, role: adminUser.role });

        // Create a client user
        const clientHashedPassword = await bcrypt.hash('clientpassword', 10);
        clientUser = await prisma.user.create({
            data: {
                name: 'Client Booking',
                email: 'client.booking@example.com',
                password: clientHashedPassword,
                role: Role.CLIENT,
            },
        });
        clientToken = signAccessToken({ userId: clientUser.id, role: clientUser.role });

        // Create a provider user
        const providerHashedPassword = await bcrypt.hash('providerpassword', 10);
        providerUser = await prisma.user.create({
            data: {
                name: 'Provider Booking',
                email: 'provider.booking@example.com',
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

    beforeEach(async () => {
        // Create an OPEN slot for each test that needs one
        const now = new Date();
        const startAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);

        openAvailabilitySlot = await prisma.availabilitySlot.create({
            data: {
                providerId: provider.id,
                serviceId: service.id,
                userId: providerUser.id, // Slot is created by the provider
                startAt: startAt,
                endAt: endAt,
                status: SlotStatus.OPEN,
            },
        });

        // Create a BOOKED slot for testing conflict scenarios
        const bookedStartAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
        const bookedEndAt = new Date(bookedStartAt.getTime() + service.durationMin * 60 * 1000);
        
        bookedAvailabilitySlot = await prisma.availabilitySlot.create({
            data: {
                providerId: provider.id,
                serviceId: service.id,
                userId: providerUser.id,
                startAt: bookedStartAt,
                endAt: bookedEndAt,
                status: SlotStatus.BOOKED,
                booking: {
                    create: {
                        userId: clientUser.id,
                        status: BookingStatus.CONFIRMED,
                    },
                },
            },
            include: { booking: true },
        });
    });

    afterEach(async () => {
        // Clean up bookings and availability slots after each test
        await prisma.booking.deleteMany();
        await prisma.availabilitySlot.deleteMany();
    });

    afterAll(async () => {
        // Clean up remaining data from beforeAll
        await prisma.token.deleteMany();
        await prisma.service.deleteMany();
        await prisma.provider.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    describe('POST /api/appointments', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/appointments')
                .send({
                    slotId: openAvailabilitySlot.id,
                    userId: clientUser.id,
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should allow a client to create a new booking for themselves', async () => {
            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: openAvailabilitySlot.id,
                    userId: clientUser.id,
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.userId).toBe(clientUser.id);
            expect(res.body.slotId).toBe(openAvailabilitySlot.id);
            
            // Check if the slot status was updated to BOOKED
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: openAvailabilitySlot.id } });
            expect(updatedSlot.status).toBe(SlotStatus.BOOKED);
            expect(updatedSlot.bookingId).toBe(res.body.id);
        });

        it('should return 400 if slot is already booked', async () => {
            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: bookedAvailabilitySlot.id, // This slot is already BOOKED
                    userId: clientUser.id,
                });

            expect(res.statusCode).toEqual(409); // Conflict, not bad request
            expect(res.body).toHaveProperty('error', 'Este horário já está reservado ou não disponível.');
        });

        it('should return 403 if client tries to book for another user', async () => {
            const anotherClientHashedPassword = await bcrypt.hash('anotherclientpassword', 10);
            const anotherClientUser = await prisma.user.create({
                data: {
                    name: 'Another Client',
                    email: 'another.client@example.com',
                    password: anotherClientHashedPassword,
                    role: Role.CLIENT,
                },
            });

            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`) // clientUser token
                .send({
                    slotId: openAvailabilitySlot.id,
                    userId: anotherClientUser.id, // clientUser tries to book for anotherClientUser
                });

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Clientes só podem agendar para si mesmos.');
        });
    });

    describe('GET /api/appointments', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/appointments');
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should allow a client to view their own bookings', async () => {
            // Create a booking for clientUser
            await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: openAvailabilitySlot.id,
                    userId: clientUser.id,
                });
            
            const res = await request(app)
                .get('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every(booking => booking.userId === clientUser.id)).toBe(true);
        });

        it('should allow a provider to view bookings related to their services', async () => {
            // We need an open slot not yet booked by clientUser for this provider
            const now = new Date();
            const startAt = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
            const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);
            const newOpenSlot = await prisma.availabilitySlot.create({
                data: {
                    providerId: provider.id,
                    serviceId: service.id,
                    userId: providerUser.id,
                    startAt: startAt,
                    endAt: endAt,
                    status: SlotStatus.OPEN,
                },
            });
            // Client books this new slot
            await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: newOpenSlot.id,
                    userId: clientUser.id,
                });

            const res = await request(app)
                .get('/api/appointments')
                .set('Authorization', `Bearer ${providerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every(booking => booking.slot.providerId === provider.id)).toBe(true);
        });

        it('should allow an ADMIN to view all bookings', async () => {
            // Need at least one booking by clientUser for providerUser's service
            // (created in previous test or setup)
            const res = await request(app)
                .get('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1); // At least one booking
            expect(res.body.some(b => b.userId === clientUser.id)).toBe(true);
        });
    });
    
    // Test for GET /api/appointments/:id
    describe('GET /api/appointments/:id', () => {
        let bookingByClient;

        beforeEach(async () => {
            const now = new Date();
            const startAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);
            const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);
            const slot = await prisma.availabilitySlot.create({
                data: {
                    providerId: provider.id,
                    serviceId: service.id,
                    userId: providerUser.id,
                    startAt: startAt,
                    endAt: endAt,
                    status: SlotStatus.OPEN,
                },
            });

            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: slot.id,
                    userId: clientUser.id,
                });
            bookingByClient = res.body;
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get(`/api/appointments/${bookingByClient.id}`);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should allow ADMIN to get any booking by ID', async () => {
            const res = await request(app)
                .get(`/api/appointments/${bookingByClient.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', bookingByClient.id);
        });

        it('should allow owner (CLIENT) to get their own booking by ID', async () => {
            const res = await request(app)
                .get(`/api/appointments/${bookingByClient.id}`)
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', bookingByClient.id);
        });

        it('should allow provider to get booking for their service by ID', async () => {
            const res = await request(app)
                .get(`/api/appointments/${bookingByClient.id}`)
                .set('Authorization', `Bearer ${providerToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', bookingByClient.id);
        });

        it('should return 403 if CLIENT tries to get another client\'s booking', async () => {
            const anotherClientHashedPassword = await bcrypt.hash('anotherclientgetpassword', 10);
            const anotherClientUser = await prisma.user.create({
                data: {
                    name: 'Another Client Get',
                    email: 'another.client.get@example.com',
                    password: anotherClientHashedPassword,
                    role: Role.CLIENT,
                },
            });
            const anotherClientToken = signAccessToken({ userId: anotherClientUser.id, role: anotherClientUser.role });
            
            const res = await request(app)
                .get(`/api/appointments/${bookingByClient.id}`)
                .set('Authorization', `Bearer ${anotherClientToken}`); // anotherClientUser token
            
            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Você não tem permissão para visualizar este agendamento.');
        });

        it('should return 404 if booking not found', async () => {
            const res = await request(app)
                .get(`/api/appointments/nonexistentbookingid`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Agendamento não encontrado.');
        });
    });

    // Test for PUT /api/appointments/:id
    describe('PUT /api/appointments/:id', () => {
        let bookingToUpdate;
        let originalSlot;
        let newOpenSlot;

        beforeEach(async () => {
            const now = new Date();
            originalSlot = await prisma.availabilitySlot.create({
                data: {
                    providerId: provider.id,
                    serviceId: service.id,
                    userId: providerUser.id,
                    startAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
                    endAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
                    status: SlotStatus.OPEN,
                },
            });
            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: originalSlot.id,
                    userId: clientUser.id,
                });
            bookingToUpdate = res.body;

            newOpenSlot = await prisma.availabilitySlot.create({
                data: {
                    providerId: provider.id,
                    serviceId: service.id,
                    userId: providerUser.id,
                    startAt: new Date(now.getTime() + 7 * 60 * 60 * 1000),
                    endAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
                    status: SlotStatus.OPEN,
                },
            });
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).put(`/api/appointments/${bookingToUpdate.id}`).send({ status: BookingStatus.CANCELLED });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should allow client to cancel their own booking', async () => {
            const res = await request(app)
                .put(`/api/appointments/${bookingToUpdate.id}`)
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ status: BookingStatus.CANCELLED });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe(BookingStatus.CANCELLED);
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: originalSlot.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
            expect(updatedSlot.bookingId).toBeNull();
        });

        it('should allow provider to cancel a booking for their service', async () => {
            const res = await request(app)
                .put(`/api/appointments/${bookingToUpdate.id}`)
                .set('Authorization', `Bearer ${providerToken}`)
                .send({ status: BookingStatus.CANCELLED });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe(BookingStatus.CANCELLED);
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: originalSlot.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
            expect(updatedSlot.bookingId).toBeNull();
        });

        it('should allow ADMIN to cancel any booking', async () => {
            const res = await request(app)
                .put(`/api/appointments/${bookingToUpdate.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: BookingStatus.CANCELLED });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe(BookingStatus.CANCELLED);
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: originalSlot.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
            expect(updatedSlot.bookingId).toBeNull();
        });

        it('should return 403 if client tries to update another client\'s booking', async () => {
            const anotherClientHashedPassword = await bcrypt.hash('anotherclientupdatepassword', 10);
            const anotherClientUser = await prisma.user.create({
                data: {
                    name: 'Another Client Update',
                    email: 'another.client.update@example.com',
                    password: anotherClientHashedPassword,
                    role: Role.CLIENT,
                },
            });
            const anotherClientToken = signAccessToken({ userId: anotherClientUser.id, role: anotherClientUser.role });

            const res = await request(app)
                .put(`/api/appointments/${bookingToUpdate.id}`)
                .set('Authorization', `Bearer ${anotherClientToken}`)
                .send({ status: BookingStatus.CANCELLED });

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Você não tem permissão para atualizar este agendamento.');
        });

        it('should allow client to reschedule their own booking', async () => {
            const res = await request(app)
                .put(`/api/appointments/${bookingToUpdate.id}`)
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ newSlotId: newOpenSlot.id });

            expect(res.statusCode).toEqual(200);
            expect(res.body.slotId).toBe(newOpenSlot.id);
            // Check old slot status
            const oldSlot = await prisma.availabilitySlot.findUnique({ where: { id: originalSlot.id } });
            expect(oldSlot.status).toBe(SlotStatus.OPEN);
            expect(oldSlot.bookingId).toBeNull();
            // Check new slot status
            const newSlot = await prisma.availabilitySlot.findUnique({ where: { id: newOpenSlot.id } });
            expect(newSlot.status).toBe(SlotStatus.BOOKED);
            expect(newSlot.bookingId).toBe(bookingToUpdate.id);
        });

        it('should return 409 if new slot is already booked during rescheduling', async () => {
            const res = await request(app)
                .put(`/api/appointments/${bookingToUpdate.id}`)
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ newSlotId: bookedAvailabilitySlot.id }); // Use an already booked slot

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('error', 'O novo horário já está reservado ou não disponível.');
        });
    });

    // Test for DELETE /api/appointments/:id
    describe('DELETE /api/appointments/:id', () => {
        let bookingToDelete;
        let slotToDelete;

        beforeEach(async () => {
            const now = new Date();
            slotToDelete = await prisma.availabilitySlot.create({
                data: {
                    providerId: provider.id,
                    serviceId: service.id,
                    userId: providerUser.id,
                    startAt: new Date(now.getTime() + 9 * 60 * 60 * 1000),
                    endAt: new Date(now.getTime() + 10 * 60 * 60 * 1000),
                    status: SlotStatus.OPEN,
                },
            });
            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    slotId: slotToDelete.id,
                    userId: clientUser.id,
                });
            bookingToDelete = res.body;
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).delete(`/api/appointments/${bookingToDelete.id}`);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should allow client to delete their own booking (cancel)', async () => {
            const res = await request(app)
                .delete(`/api/appointments/${bookingToDelete.id}`)
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.statusCode).toEqual(204);

            const deletedBooking = await prisma.booking.findUnique({ where: { id: bookingToDelete.id } });
            expect(deletedBooking).toBeNull();
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: slotToDelete.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
            expect(updatedSlot.bookingId).toBeNull();
        });

        it('should allow provider to delete a booking for their service (cancel)', async () => {
            const res = await request(app)
                .delete(`/api/appointments/${bookingToDelete.id}`)
                .set('Authorization', `Bearer ${providerToken}`);
            expect(res.statusCode).toEqual(204);

            const deletedBooking = await prisma.booking.findUnique({ where: { id: bookingToDelete.id } });
            expect(deletedBooking).toBeNull();
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: slotToDelete.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
            expect(updatedSlot.bookingId).toBeNull();
        });

        it('should allow ADMIN to delete any booking', async () => {
            const res = await request(app)
                .delete(`/api/appointments/${bookingToDelete.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(204);

            const deletedBooking = await prisma.booking.findUnique({ where: { id: bookingToDelete.id } });
            expect(deletedBooking).toBeNull();
            const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: slotToDelete.id } });
            expect(updatedSlot.status).toBe(SlotStatus.OPEN);
            expect(updatedSlot.bookingId).toBeNull();
        });

        it('should return 403 if client tries to delete another client\'s booking', async () => {
            const anotherClientHashedPassword = await bcrypt.hash('anotherclientdeletepassword', 10);
            const anotherClientUser = await prisma.user.create({
                data: {
                    name: 'Another Client Delete',
                    email: 'another.client.delete@example.com',
                    password: anotherClientHashedPassword,
                    role: Role.CLIENT,
                },
            });
            const anotherClientToken = signAccessToken({ userId: anotherClientUser.id, role: anotherClientUser.role });

            const res = await request(app)
                .delete(`/api/appointments/${bookingToDelete.id}`)
                .set('Authorization', `Bearer ${anotherClientToken}`);
            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Você não tem permissão para cancelar este agendamento.');
        });

        it('should return 404 if booking not found for deletion', async () => {
            const res = await request(app)
                .delete(`/api/appointments/nonexistentbookingid`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Agendamento não encontrado para exclusão.');
        });
    });
});
