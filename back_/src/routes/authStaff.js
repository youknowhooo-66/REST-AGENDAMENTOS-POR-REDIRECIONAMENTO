import express from 'express';
import { staffController } from '../controller/Staff/StaffController.js';

export const staffRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) e para PROVEDORES 🛑

// CREATE: Adicionar novo funcionário
staffRouter.post('/', staffController.create);

// READ: Listar todos os funcionários do provedor autenticado
staffRouter.get('/', staffController.getAll);

// READ: Buscar funcionário por ID
staffRouter.get('/:id', staffController.getById);

// UPDATE: Atualizar funcionário
staffRouter.put('/:id', staffController.update);

// DELETE: Deletar funcionário
staffRouter.delete('/:id', staffController.delete);