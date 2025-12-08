import express from 'express';
import {
    createBooking,
    cancelBooking,
    getClientBookings,
    getProviderBookings,
    providerCancelBooking,
    createGuestBooking
} from '../controller/Booking/BookingController.js';
import { validate } from '../middleware/validation.js';
import {
    createBookingSchema,
    listBookingsSchema,
    cancelBookingSchema
} from '../middleware/validation.js';

export const bookingRouter = express.Router();

// CREATE GUEST: Criar um novo agendamento e registrar um novo usuário (convidado)
bookingRouter.post('/guest', createGuestBooking);

// CREATE: Criar um novo agendamento (com validação)
bookingRouter.post('/',
    validate(createBookingSchema),
    createBooking
);

// GET: Listar agendamentos do cliente (com validação de paginação)
bookingRouter.get('/',
    validate(listBookingsSchema),
    getClientBookings
);

// GET: Listar agendamentos do provedor (com validação de paginação)
bookingRouter.get('/provider',
    validate(listBookingsSchema),
    getProviderBookings
);

// CANCEL: Cancelar agendamento via token (link de email)
bookingRouter.get('/cancel',
    cancelBooking
);

// CANCEL: Provedor cancela um agendamento
bookingRouter.delete('/:bookingId/provider-cancel',
    validate(cancelBookingSchema),
    providerCancelBooking
);

