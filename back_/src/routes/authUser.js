// src/routes/userRoutes.js

import express from 'express';
import { userController } from '../controller/User/userController.js';
import { validate } from '../middleware/validation.js'; // Import the validate middleware
import { changePasswordSchema } from '../middleware/validation.js'; // Import the changePasswordSchema

export const userRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) 🛑

// READ: Listar todos os usuários (Geralmente requer ADMIN)
userRouter.get('/', userController.getAll);

// READ: Buscar usuário pelo ID (Pode ser acessado pelo próprio usuário logado ou ADMIN)
userRouter.get('/:id', userController.getById);

// UPDATE: Atualizar dados do perfil do usuário logado
userRouter.put('/profile', userController.updateProfile);

// UPDATE: Atualizar dados do usuário (Pode ser acessado pelo próprio usuário logado ou ADMIN)
userRouter.put('/:id', userController.update);

// DELETE: Deletar usuário (Geralmente requer ADMIN)
userRouter.delete('/:id', userController.delete);

// UPDATE: Alterar senha do usuário logado
userRouter.put('/change-password', validate(changePasswordSchema), userController.changePassword);