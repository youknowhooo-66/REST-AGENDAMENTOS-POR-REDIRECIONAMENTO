import express from 'express';
import { staffController } from '../controller/Staff/StaffController.js';
import { auth } from '../middleware/auth.js'; // Middleware de proteção

export const staffRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) e para PROVEDORES 🛑

// CREATE: Adicionar novo funcionário
staffRouter.post('/', auth, staffController.create);

// READ: Listar todos os funcionários do provedor autenticado
staffRouter.get('/', auth, staffController.getAll);

// READ: Buscar funcionário por ID
staffRouter.get('/:id', auth, staffController.getById);

// UPDATE: Atualizar funcionário
staffRouter.put('/:id', auth, staffController.update);

// DELETE: Deletar funcionário
staffRouter.delete('/:id', auth, staffController.delete);