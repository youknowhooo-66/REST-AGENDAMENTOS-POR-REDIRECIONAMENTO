// src/routes/authRoutes.js

import express from 'express';
import { authController } from '../controller/Auth/AuthController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema
} from '../middleware/validation.js';

export const authRouter = express.Router();

// Rota Pública: Registro de novo usuário (com validação)
authRouter.post('/register',
    validate(registerSchema),
    authController.register
);

// Rota Pública: Login (com validação)
authRouter.post('/login',
    validate(loginSchema),
    authController.login
);

// Rota Pública: Renovação do Access Token (com validação)
authRouter.post('/refresh',
    validate(refreshTokenSchema),
    authController.refresh
);

// Rota Pública: Logout (com validação)
authRouter.post('/logout',
    validate(refreshTokenSchema),
    authController.logout
);