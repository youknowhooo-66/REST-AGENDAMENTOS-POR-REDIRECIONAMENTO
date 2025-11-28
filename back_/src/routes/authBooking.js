import express from 'express';
import { createBooking, cancelBooking, getClientBookings, getProviderBookings, providerCancelBooking } from '../controller/Booking/BookingController.js'; // Import getProviderBookings

export const bookingRouter = express.Router();

// CREATE: Criar um novo agendamento (protegido para clientes)
bookingRouter.post('/', createBooking);

// GET: Listar todos os agendamentos do cliente autenticado
bookingRouter.get('/', getClientBookings);

// GET: Listar todos os agendamentos do provedor autenticado
bookingRouter.get('/provider', getProviderBookings);

// CANCEL: Cancelar um agendamento (rota pública, acessada via link de e-mail)
// Note: This should ideally be a POST to prevent accidental cancellations.
bookingRouter.get('/cancel', cancelBooking);

// CANCEL: Cancelar um agendamento pelo provedor
bookingRouter.post('/:bookingId/provider-cancel', providerCancelBooking);

// TODO: Implementar rota para buscar um agendamento específico do cliente
// bookingRouter.get('/:id', bookingController.getClientBookingById);
