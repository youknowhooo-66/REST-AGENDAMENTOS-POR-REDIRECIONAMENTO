// src/routes/authRoutes.js

import express from 'express';
import { authController } from '../controller/Auth/AuthController.js';
import { auth } from '../middleware/auth.js';


export const authRouter = express.Router();
// const router = express.Router();
// Rota Pública: Registro de novo usuário
authRouter.post('/register', authController.register);

// Rota Pública: Login
authRouter.post('/login', authController.login);

// Rota Pública: Renovação do Access Token (usando Refresh Token no corpo)
authRouter.post('/refresh', auth, authController.refresh);

// Rota Pública: Logout (revoga o Refresh Token)
authRouter.post('/logout', authController.logout);