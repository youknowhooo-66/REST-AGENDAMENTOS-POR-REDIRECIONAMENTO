import express from 'express';
import { dashboardController } from '../controller/Dashboard/DashboardController.js';
import { auth } from '../middleware/auth.js'; // Middleware de proteção
import pkg from '@prisma/client';
const { Role } = pkg;

export const dashboardRouter = express.Router();

// Middleware para verificar se o usuário é um PROVIDER
const isProvider = (req, res, next) => {
    if (req.user && req.user.role === Role.PROVIDER) {
        next();
    } else {
        res.status(403).json({ error: 'Apenas provedores podem acessar o dashboard.' });
    }
};

// GET: Estatísticas do dashboard para o provedor autenticado
dashboardRouter.get('/stats', auth, isProvider, dashboardController.getProviderStats);
