import express from 'express';
import { createBooking, cancelBooking, getClientBookings } from '../controller/Booking/BookingController.js'; // Import getClientBookings
import { auth } from '../middleware/auth.js'; // Middleware de proteção
import pkg from '@prisma/client';
const { Role } = pkg;

export const bookingRouter = express.Router();

// Middleware para verificar se o usuário é um CLIENT
const isClient = (req, res, next) => {
    if (req.user && req.user.role === Role.CLIENT) {
        next();
    } else {
        res.status(403).json({ error: 'Apenas clientes podem realizar esta ação.' });
    }
};

// CREATE: Criar um novo agendamento (protegido para clientes)
bookingRouter.post('/', auth, isClient, createBooking);

// GET: Listar todos os agendamentos do cliente autenticado
bookingRouter.get('/', auth, isClient, getClientBookings);

// CANCEL: Cancelar um agendamento (rota pública, acessada via link de e-mail)
bookingRouter.get('/cancel', cancelBooking);

// TODO: Implementar rota para buscar um agendamento específico do cliente
// bookingRouter.get('/:id', auth, isClient, bookingController.getClientBookingById);
