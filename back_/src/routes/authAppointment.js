// src/routes/appointmentRoutes.js

import express from 'express';
import { appointmentController } from '../controller/Appointment/AppointmentController.js';
import { auth } from '../middleware/auth.js'; // Middleware de proteção

export const appointmentRouter = express.Router();
const router = express.Router();
// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) 🛑

// CREATE: Criar novo agendamento (Cliente ou Admin)
router.post('/appointment', auth, appointmentController.create);

// READ: Listar todos os agendamentos
router.get('/appointment', auth, appointmentController.getAll);

// READ: Buscar agendamento por ID
router.get('/appointment/:id', auth, appointmentController.getById);

// UPDATE: Atualizar agendamento
router.put('/appointment/:id', auth, appointmentController.update);

// DELETE: Deletar agendamento
router.delete('/appointment/:id', auth, appointmentController.delete);
