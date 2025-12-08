import {prisma} from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { Role } = pkg;

class ServiceController {
    
    // CREATE
    async create(req, res) {
        const { name, price, durationMin, description, imageUrl, images } = req.body;
        const { userId, role } = req.user; // Obtém userId e role do token autenticado

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem criar serviços.' });
        }
        
        // Validação básica
        if (!name || price === undefined || durationMin === undefined) {
             return res.status(400).json({ error: 'Nome, preço e duração (em minutos) são obrigatórios.' });
        }

        // Validar imagens (máximo 10)
        if (images && Array.isArray(images) && images.length > 10) {
            return res.status(400).json({ error: 'Máximo de 10 imagens permitidas.' });
        }

        try {
            // Encontrar o Provider associado ao userId
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            // Preparar dados de imagem
            const imageData = {};
            if (images && Array.isArray(images) && images.length > 0) {
                imageData.images = images;
                imageData.imageUrl = images[0] || imageUrl || null; // Primeira imagem como imageUrl para compatibilidade
            } else if (imageUrl) {
                imageData.imageUrl = imageUrl;
                imageData.images = [imageUrl]; // Converter imageUrl único para array
            }

            const newService = await prisma.service.create({
                data: {
                    name,
                    description,
                    priceCents: Math.round(parseFloat(price) * 100),
                    durationMin: parseInt(durationMin),
                    providerId: provider.id, // Associa o serviço ao provedor
                    ...imageData,
                },
            });
            
            // Parse images JSON se necessário
            if (newService.images && typeof newService.images === 'string') {
                try {
                    newService.images = JSON.parse(newService.images);
                } catch (e) {
                    newService.images = null;
                }
            }
            
            return res.status(201).json(newService);
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Um serviço com este nome já existe para este provedor.' });
            }
            console.error('Erro ao criar serviço:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar serviço.' });
        }
    }

    // READ (Listar todos e Buscar)
    async getAll(req, res) {
        const { userId, role } = req.user;
        const { search } = req.query; // Extract search term

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem listar/buscar serviços.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            let whereClause = { providerId: provider.id };

            if (search) {
                whereClause.name = {
                    contains: search,
                    mode: 'insensitive', // Case-insensitive search
                };
            }

            const services = await prisma.service.findMany({
                where: whereClause,
            });
            
            // Parse images JSON se necessário
            const servicesWithParsedImages = services.map(service => {
                if (service.images && typeof service.images === 'string') {
                    try {
                        service.images = JSON.parse(service.images);
                    } catch (e) {
                        service.images = null;
                    }
                }
                return service;
            });
            
            return res.status(200).json(servicesWithParsedImages);
        } catch (error) {
            console.error('Erro ao listar/buscar serviços:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // READ (By ID)
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

            const service = await prisma.service.findFirst({
                where: {
                    id: id,
                    providerId: provider.id, // Garante que o serviço pertence ao provedor
                },
            });

            if (!service) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }

            // Parse images JSON se necessário
            if (service.images && typeof service.images === 'string') {
                try {
                    service.images = JSON.parse(service.images);
                } catch (e) {
                    service.images = null;
                }
            }

            return res.status(200).json(service);
        } catch (error) {
            console.error('Erro ao buscar serviço por ID:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // UPDATE
    async update(req, res) {
        const { id } = req.params;
        const { name, price, durationMin, description, imageUrl, images } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem atualizar serviços.' });
        }

        // Validar imagens (máximo 10)
        if (images && Array.isArray(images) && images.length > 10) {
            return res.status(400).json({ error: 'Máximo de 10 imagens permitidas.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            // Verificar se o serviço pertence ao provedor antes de atualizar
            const existingService = await prisma.service.findFirst({
                where: { id: id, providerId: provider.id },
            });

            if (!existingService) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }
            
            // Preparar dados de atualização
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (price !== undefined) updateData.priceCents = Math.round(parseFloat(price) * 100);
            if (durationMin !== undefined) updateData.durationMin = parseInt(durationMin);
            
            // Atualizar imagens
            if (images !== undefined) {
                if (Array.isArray(images) && images.length > 0) {
                    updateData.images = images;
                    updateData.imageUrl = images[0] || imageUrl || null; // Primeira imagem como imageUrl
                } else {
                    updateData.images = null;
                }
            } else if (imageUrl !== undefined) {
                updateData.imageUrl = imageUrl;
                // Se não tiver images, criar array com imageUrl
                if (!existingService.images) {
                    updateData.images = imageUrl ? [imageUrl] : null;
                }
            }
            
            const updatedService = await prisma.service.update({
                where: { id: id, providerId: provider.id }, // Garante que só atualiza o próprio serviço
                data: updateData,
            });
            
            // Parse images JSON se necessário
            if (updatedService.images && typeof updatedService.images === 'string') {
                try {
                    updatedService.images = JSON.parse(updatedService.images);
                } catch (e) {
                    updatedService.images = null;
                }
            }
            
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
                where: { id: id, providerId: provider.id },
            });

            if (!existingService) {
                return res.status(404).json({ error: 'Serviço não encontrado ou não pertence a este provedor.' });
            }

            await prisma.service.delete({
                where: { id: id, providerId: provider.id }, // Garante que só deleta o próprio serviço
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


}

export const serviceController = new ServiceController();