import {prisma} from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { Role } = pkg;

class ServiceController {
    
    // CREATE
    async create(req, res) {
        const { name, price, durationMin } = req.body;
        const { userId, role } = req.user; // Obtém userId e role do token autenticado

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem criar serviços.' });
        }
        
        // Validação básica
        if (!name || price === undefined || durationMin === undefined) {
             return res.status(400).json({ error: 'Nome, preço e duração (em minutos) são obrigatórios.' });
        }

        try {
            // Encontrar o Provider associado ao userId
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const newService = await prisma.service.create({
                data: {
                    name,
                    price: parseFloat(price),
                    durationMin: parseInt(durationMin),
                    providerId: provider.id, // Associa o serviço ao provedor
                },
            });
            return res.status(201).json(newService);
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Um serviço com este nome já existe para este provedor.' });
            }
            console.error('Erro ao criar serviço:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar serviço.' });
        }
    }

    // READ (Listar todos)
    async getAll(req, res) {
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem listar serviços.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const services = await prisma.service.findMany({
                where: { providerId: provider.id },
            });
            return res.status(200).json(services);
        } catch (error) {
            console.error('Erro ao listar serviços:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // READ (Buscar por ID)
    async getById(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem visualizar serviços.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const service = await prisma.service.findUnique({
                where: { id: parseInt(id), providerId: provider.id },
            });
            if (!service) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }
            return res.status(200).json(service);
        } catch (error) {
             console.error('Erro ao buscar serviço:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // UPDATE
    async update(req, res) {
        const { id } = req.params;
        const { name, price, durationMin } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem atualizar serviços.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            // Verificar se o serviço pertence ao provedor antes de atualizar
            const existingService = await prisma.service.findUnique({
                where: { id: parseInt(id), providerId: provider.id },
            });

            if (!existingService) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }
            
            const updatedService = await prisma.service.update({
                where: { id: parseInt(id), providerId: provider.id }, // Garante que só atualiza o próprio serviço
                data: {
                    name,
                    price: price !== undefined ? parseFloat(price) : undefined,
                    durationMin: durationMin !== undefined ? parseInt(durationMin) : undefined,
                },
            });
            return res.status(200).json(updatedService);
        } catch (error) {
            if (error.code === 'P2025') {
                 return res.status(404).json({ error: 'Serviço não encontrado para atualizar.' });
            }
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Um serviço com este nome já existe.' });
            }
            console.error('Erro ao atualizar serviço:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao atualizar serviço.' });
        }
    }

    // DELETE
    async delete(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem deletar serviços.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            // Verificar se o serviço pertence ao provedor antes de deletar
            const existingService = await prisma.service.findUnique({
                where: { id: parseInt(id), providerId: provider.id },
            });

            if (!existingService) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }

            await prisma.service.delete({
                where: { id: parseInt(id), providerId: provider.id }, // Garante que só deleta o próprio serviço
            });
            return res.status(204).send();
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Serviço não encontrado para exclusão.' });
            }
            // P2003: Foreign key constraint failed (se houver agendamentos associados)
            if (error.code === 'P2003') {
                return res.status(409).json({ error: 'Não é possível excluir o serviço, pois existem agendamentos associados.' });
            }
            console.error('Erro ao deletar serviço:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // SEARCH
    async search(req, res) {
        const { name } = req.query; // Get search term from query parameters
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem buscar serviços.' });
        }

        if (!name) {
            return res.status(400).json({ error: 'O parâmetro "name" é obrigatório para a busca.' });
        }
        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const services = await prisma.service.findMany({
                where: {
                    providerId: provider.id,
                    name: {
                        contains: name,
                        mode: 'insensitive', // Case-insensitive search
                    },
                },
            });
            return res.status(200).json(services);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao buscar serviços.' });
        }
    }
}

export const serviceController = new ServiceController();