// src/routes/appointmentRoutes.js

import express from 'express';
import { appointmentController } from '../controller/Appointment/AppointmentController.js';

export const appointmentRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) 🛑

// CREATE: Criar novo agendamento (Cliente ou Admin)
appointmentRouter.post('/', appointmentController.create);

// READ: Listar todos os agendamentos
appointmentRouter.get('/', appointmentController.getAll);

// READ: Buscar agendamento por ID
appointmentRouter.get('/:id', appointmentController.getById);

// UPDATE: Atualizar agendamento
appointmentRouter.put('/:id', appointmentController.update);

// DELETE: Deletar agendamento
appointmentRouter.delete('/:id', appointmentController.delete);
