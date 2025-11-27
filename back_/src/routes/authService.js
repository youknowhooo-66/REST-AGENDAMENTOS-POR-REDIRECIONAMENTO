// src/routes/serviceRoutes.js

import express from 'express';
import { serviceController } from '../controller/Service/ServiceController.js';
import { auth } from '../middleware/auth.js'; // Middleware de proteção

export const serviceRouter = express.Router();
const router = express.Router();
// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) 🛑

// CREATE: Criar novo serviço
router.post('/services', auth, serviceController.create);

// SEARCH: Buscar serviços por nome
router.get('/services/search', auth, serviceController.search);

// READ: Listar todos os serviços (Pode ser pública se o público puder ver a lista)
// Deixaremos protegida por padrão para o CRUD:
router.get('/services', auth, serviceController.getAll); 

// READ: Buscar serviço por ID
router.get('/services/:id', auth, serviceController.getById);

// UPDATE: Atualizar serviço
router.put('/services/:id', auth, serviceController.update);

// DELETE: Deletar serviço
router.delete('/services/:id', auth, serviceController.delete);
