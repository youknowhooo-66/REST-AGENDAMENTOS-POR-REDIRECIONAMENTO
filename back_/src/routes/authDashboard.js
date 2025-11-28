import express from 'express';
import { dashboardController } from '../controller/Dashboard/DashboardController.js';

export const dashboardRouter = express.Router();

// GET: Estatísticas do dashboard para o provedor autenticado
dashboardRouter.get('/stats', dashboardController.getProviderStats);

// GET: Próximos agendamentos para o provedor autenticado
dashboardRouter.get('/upcoming-appointments', dashboardController.getUpcomingAppointments);
