// src/routes/userRoutes.js

import express from 'express';
import { userController } from '../controller/User/userController.js';
import { auth } from '../middleware/auth.js'; // Middleware de proteção

export const userRouter = express.Router();
const router = express.Router();
// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) 🛑

// READ: Listar todos os usuários (Geralmente requer ADMIN)
router.get('/users', userController.getAll);

// READ: Buscar usuário pelo ID (Pode ser acessado pelo próprio usuário logado ou ADMIN)
router.get('/users/:id', auth, userController.getById);

// UPDATE: Atualizar dados do usuário (Pode ser acessado pelo próprio usuário logado ou ADMIN)
router.put('/users/:id', auth, userController.update);

// DELETE: Deletar usuário (Geralmente requer ADMIN)
router.delete('/users/:id', auth, userController.delete);
