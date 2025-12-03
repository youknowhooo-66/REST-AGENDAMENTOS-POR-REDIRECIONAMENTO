import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prismaClient.js';
import { signAccessToken } from '../src/utils/jwt.js';
import bcrypt from 'bcrypt';
import pkg from '@prisma/client';

const { Role } = pkg;

describe('User API', () => {
    let adminUser, adminToken;
    let clientUser, clientToken;
    let providerUser, providerToken;

    beforeAll(async () => {
        // Create an admin user
        const adminHashedPassword = await bcrypt.hash('adminpassword', 10);
        adminUser = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@example.com',
                password: adminHashedPassword,
                role: Role.ADMIN,
            },
        });
        adminToken = signAccessToken({ userId: adminUser.id, role: adminUser.role });

        // Create a client user
        const clientHashedPassword = await bcrypt.hash('clientpassword', 10);
        clientUser = await prisma.user.create({
            data: {
                name: 'Client User',
                email: 'client@example.com',
                password: clientHashedPassword,
                role: Role.CLIENT,
            },
        });
        clientToken = signAccessToken({ userId: clientUser.id, role: clientUser.role });

        // Create a provider user
        const providerHashedPassword = await bcrypt.hash('providerpassword', 10);
        providerUser = await prisma.user.create({
            data: {
                name: 'Provider User',
                email: 'provider@example.com',
                password: providerHashedPassword,
                role: Role.PROVIDER,
            },
        });
        providerToken = signAccessToken({ userId: providerUser.id, role: providerUser.role });

        // Create a provider entry for the provider user
        await prisma.provider.create({
            data: {
                name: providerUser.name,
                ownerId: providerUser.id,
            },
        });
    });

    afterAll(async () => {
        // Clean up database
        await prisma.token.deleteMany();
        await prisma.booking.deleteMany();
        await prisma.availabilitySlot.deleteMany();
        await prisma.service.deleteMany();
        await prisma.provider.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    describe('GET /api/users', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/users');
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should return 403 if user is not an ADMIN', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${clientToken}`); // Client trying to access all users

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Apenas administradores podem listar todos os usuários.');
        });

        it('should return all users if user is an ADMIN', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(3); // admin, client, provider
            expect(res.body.some(u => u.email === adminUser.email)).toBe(true);
            expect(res.body.some(u => u.email === clientUser.email)).toBe(true);
            expect(res.body.some(u => u.email === providerUser.email)).toBe(true);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get(`/api/users/${clientUser.id}`);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'missing token');
        });

        it('should allow an ADMIN to get any user by ID', async () => {
            const res = await request(app)
                .get(`/api/users/${clientUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', clientUser.id);
            expect(res.body.email).toBe(clientUser.email);
        });

        it('should allow a regular user (CLIENT) to get their own profile by ID', async () => {
            const res = await request(app)
                .get(`/api/users/${clientUser.id}`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', clientUser.id);
            expect(res.body.email).toBe(clientUser.email);
        });

        it('should return 403 if a regular user (CLIENT) tries to get another user by ID', async () => {
            const res = await request(app)
                .get(`/api/users/${adminUser.id}`) // Client trying to get admin
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('error', 'Você não tem permissão para visualizar este usuário.');
        });

        it('should return 404 if user not found (even for ADMIN)', async () => {
            const res = await request(app)
                .get(`/api/users/nonexistentid`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Usuário não encontrado.');
        });
    });
});
