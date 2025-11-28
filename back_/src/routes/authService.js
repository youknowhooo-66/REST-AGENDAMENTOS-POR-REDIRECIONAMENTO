// src/routes/serviceRoutes.js

import express from 'express';
import { serviceController } from '../controller/Service/ServiceController.js';

export const serviceRouter = express.Router();

// 🛑 Todas as rotas abaixo são PROTEGIDAS (Auth) 🛑

// CREATE: Criar novo serviço
serviceRouter.post('/', serviceController.create);

// SEARCH: Buscar serviços por nome
serviceRouter.get('/search', serviceController.search);

// READ: Listar todos os serviços
serviceRouter.get('/', serviceController.getAll); 

// READ: Buscar serviço por ID
serviceRouter.get('/:id', serviceController.getById);

// UPDATE: Atualizar serviço
serviceRouter.put('/:id', serviceController.update);

// DELETE: Deletar serviço
serviceRouter.delete('/:id', serviceController.delete);
