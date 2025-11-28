import express from 'express';
import { availabilitySlotController } from '../controller/AvailabilitySlot/AvailabilitySlotController.js';

export const availabilitySlotRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) e para PROVEDORES 🛑

// CREATE: Criar novo horário de disponibilidade
availabilitySlotRouter.post('/', availabilitySlotController.create);

// CREATE BULK: Criar múltiplos horários de disponibilidade em lote
availabilitySlotRouter.post('/bulk', availabilitySlotController.createBulk);

// READ: Listar todos os horários de disponibilidade do provedor autenticado
availabilitySlotRouter.get('/', availabilitySlotController.getAll);

// READ: Buscar horário de disponibilidade por ID
availabilitySlotRouter.get('/:id', availabilitySlotController.getById);

// UPDATE: Atualizar horário de disponibilidade
availabilitySlotRouter.put('/:id', availabilitySlotController.update);

// DELETE: Deletar horário de disponibilidade
availabilitySlotRouter.delete('/:id', availabilitySlotController.delete);