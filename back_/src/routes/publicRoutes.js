import express from 'express';
import { publicController } from '../controller/Public/PublicController.js';
import { createGuestBooking } from '../controller/Booking/BookingController.js'; // Import createGuestBooking

export const publicRouter = express.Router();

// GET: Listar todos os serviços de todos os provedores
publicRouter.get('/services', publicController.getAllServices);

// GET: Buscar um serviço específico pelo ID
publicRouter.get('/services/:id', publicController.getServiceById);

// GET: Buscar horários disponíveis para um serviço em uma data específica
publicRouter.get('/services/:serviceId/slots', publicController.getAvailableSlots);

// GET: Buscar funcionários disponíveis para um serviço
publicRouter.get('/services/:serviceId/staff', publicController.getStaffByService);

// GET: Buscar horários disponíveis para um funcionário em uma data específica
publicRouter.get('/staff/:staffId/slots', publicController.getSlotsByStaff);

// POST: Criar um novo agendamento e registrar um novo usuário (convidado) - Rota Pública
publicRouter.post('/bookings/guest', createGuestBooking);
