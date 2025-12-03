import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prismaClient';
import bcrypt from 'bcrypt';

describe('Auth API', () => {
  // Clean up database before and after tests
  beforeEach(async () => {
    await prisma.token.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.service.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.token.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.service.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return it', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test User');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.role).toBe('CLIENT');

      const dbUser = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
      expect(dbUser).not.toBeNull();
    });

    it('should return 409 if user already exists', async () => {
      await prisma.user.create({
        data: {
          name: 'Existing User',
          email: 'test@example.com',
          password: 'password123'
        }
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Usuário já existe');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword
        }
      });
    });

    it('should login an existing user and return tokens', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Credenciais inválidas');
    });
  });
});
