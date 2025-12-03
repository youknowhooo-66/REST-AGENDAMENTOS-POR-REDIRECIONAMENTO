import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prismaClient.js';
import { signAccessToken } from '../src/utils/jwt.js';
import pkg from '@prisma/client';

const { Role } = pkg;

describe('Service API', () => {
    let provider, user, token;

    beforeAll(async () => {
        // Create a user and a provider for testing
        user = await prisma.user.create({
            data: {
                name: 'Test User Service',
                email: 'provider-service-test@example.com',
                password: 'password123',
                role: Role.PROVIDER,
            },
        });

        provider = await prisma.provider.create({
            data: {
                name: 'Test Provider for Service',
                ownerId: user.id,
            },
        });

        // Generate a token for the user
        token = signAccessToken({ userId: user.id, role: user.role });
    });

    afterAll(async () => {
        // Clean up the database
        await prisma.service.deleteMany({ where: { providerId: provider.id } });
        await prisma.provider.delete({ where: { id: provider.id } });
        await prisma.user.delete({ where: { id: user.id } });
    });

    describe('GET /api/services', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/services');
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should return 200 and a list of services for an authenticated provider', async () => {
            // Create a service for the provider
            await prisma.service.create({
                data: {
                    name: 'Test Service',
                    priceCents: 10000,
                    durationMin: 60,
                    providerId: provider.id,
                },
            });

            const res = await request(app)
                .get('/api/services')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('name', 'Test Service');
        });
    });

    describe('POST /api/services', () => {
        it('should create a new service', async () => {
            const res = await request(app)
                .post('/api/services')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Service',
                    price: 200,
                    durationMin: 90,
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('New Service');
            expect(res.body.priceCents).toBe(20000); // Price is in cents
        });
    });

    describe('GET /api/services/:id', () => {
        let service;

        beforeEach(async () => {
            service = await prisma.service.create({
                data: {
                    name: 'Service By ID',
                    priceCents: 5000,
                    durationMin: 30,
                    providerId: provider.id,
                },
            });
        });

        it('should return a service by ID', async () => {
            const res = await request(app)
                .get(`/api/services/${service.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', service.id);
            expect(res.body.name).toBe('Service By ID');
        });

        it('should return 404 if service not found', async () => {
            const res = await request(app)
                .get(`/api/services/nonexistentid`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Serviço não encontrado ou não pertence a este provedor.');
        });
    });

    describe('PUT /api/services/:id', () => {
        let service;

        beforeEach(async () => {
            service = await prisma.service.create({
                data: {
                    name: 'Service to Update',
                    priceCents: 6000,
                    durationMin: 45,
                    providerId: provider.id,
                },
            });
        });

        it('should update a service', async () => {
            const res = await request(app)
                .put(`/api/services/${service.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Service',
                    price: 70,
                    durationMin: 50,
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', service.id);
            expect(res.body.name).toBe('Updated Service');
            expect(res.body.priceCents).toBe(7000);
        });

        it('should return 404 if service not found for update', async () => {
            const res = await request(app)
                .put(`/api/services/nonexistentid`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Service',
                });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Serviço não encontrado ou não pertence a este provedor.');
        });
    });

    describe('DELETE /api/services/:id', () => {
        let service;

        beforeEach(async () => {
            service = await prisma.service.create({
                data: {
                    name: 'Service to Delete',
                    priceCents: 8000,
                    durationMin: 20,
                    providerId: provider.id,
                },
            });
        });

        it('should delete a service', async () => {
            const res = await request(app)
                .delete(`/api/services/${service.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(204);

            const deletedService = await prisma.service.findUnique({ where: { id: service.id } });
            expect(deletedService).toBeNull();
        });

        it('should return 404 if service not found for deletion', async () => {
            const res = await request(app)
                .delete(`/api/services/nonexistentid`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Serviço não encontrado ou não pertence a este provedor.');
        });
    });
});
