import express from 'express';
import { publicController } from '../controller/Public/PublicController.js';

export const publicRouter = express.Router();

// GET: Listar todos os serviços de todos os provedores
publicRouter.get('/services', publicController.getAllServices);

// GET: Buscar um serviço específico pelo ID
publicRouter.get('/services/:id', publicController.getServiceById);

// GET: Buscar horários disponíveis para um serviço em uma data específica
publicRouter.get('/services/:serviceId/slots', publicController.getAvailableSlots);
