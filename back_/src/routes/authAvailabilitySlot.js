import express from 'express';
import { availabilitySlotController } from '../controller/AvailabilitySlot/AvailabilitySlotController.js';
import { auth } from '../middleware/auth.js'; // Middleware de proteção

export const availabilitySlotRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) e para PROVEDORES 🛑

// CREATE: Criar novo horário de disponibilidade
availabilitySlotRouter.post('/', auth, availabilitySlotController.create);

// READ: Listar todos os horários de disponibilidade do provedor autenticado
availabilitySlotRouter.get('/', auth, availabilitySlotController.getAll);

// READ: Buscar horário de disponibilidade por ID
availabilitySlotRouter.get('/:id', auth, availabilitySlotController.getById);

// UPDATE: Atualizar horário de disponibilidade
availabilitySlotRouter.put('/:id', auth, availabilitySlotController.update);

// DELETE: Deletar horário de disponibilidade
availabilitySlotRouter.delete('/:id', auth, availabilitySlotController.delete);