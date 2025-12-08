import  {prisma}  from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { Role } = pkg;

class StaffController {

    async create(req, res) {
        const { name, imageUrl } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem adicionar funcionários.' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Nome do funcionário é obrigatório.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const newStaff = await prisma.staff.create({
                data: {
                    name,
                    imageUrl: imageUrl || null,
                    providerId: provider.id,
                },
            });
            return res.status(201).json(newStaff);
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar funcionário.' });
        }
    }

    async getAll(req, res) {
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem listar funcionários.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const staff = await prisma.staff.findMany({
                where: { providerId: provider.id },
            });
            return res.status(200).json(staff);
        } catch (error) {
            console.error('Erro ao listar funcionários:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao listar funcionários.' });
        }
    }

    async getById(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem visualizar funcionários.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const staffMember = await prisma.staff.findUnique({
                where: { id: id, providerId: provider.id },
            });

            if (!staffMember) {
                return res.status(404).json({ error: 'Funcionário não encontrado ou não pertence a este provedor.' });
            }
            return res.status(200).json(staffMember);
        } catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao buscar funcionário.' });
        }
    }

    async update(req, res) {
        const { id } = req.params;
        const { name, imageUrl } = req.body;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem atualizar funcionários.' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Nome do funcionário é obrigatório.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const existingStaff = await prisma.staff.findUnique({
                where: { id: id, providerId: provider.id },
            });

            if (!existingStaff) {
                return res.status(404).json({ error: 'Funcionário não encontrado ou não pertence a este provedor.' });
            }

            const updateData = { name };
            if (imageUrl !== undefined) {
                updateData.imageUrl = imageUrl;
            }

            const updatedStaff = await prisma.staff.update({
                where: { id: id, providerId: provider.id },
                data: updateData,
            });
            return res.status(200).json(updatedStaff);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Funcionário não encontrado para atualizar.' });
            }
            console.error('Erro ao atualizar funcionário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao atualizar funcionário.' });
        }
    }

    async delete(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.PROVIDER) {
            return res.status(403).json({ error: 'Apenas provedores podem deletar funcionários.' });
        }

        try {
            const provider = await prisma.provider.findFirst({
                where: { ownerId: userId },
            });

            if (!provider) {
                return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
            }

            const existingStaff = await prisma.staff.findUnique({
                where: { id: id, providerId: provider.id },
            });

            if (!existingStaff) {
                return res.status(404).json({ error: 'Funcionário não encontrado ou não pertence a este provedor.' });
            }

            await prisma.staff.delete({
                where: { id: id, providerId: provider.id },
            });
            return res.status(204).send();
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Funcionário não encontrado para exclusão.' });
            }
            if (error.code === 'P2003') { // Foreign key constraint failed
                return res.status(409).json({ error: 'Não é possível excluir o funcionário, pois existem agendamentos associados.' });
            }
            console.error('Erro ao deletar funcionário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao deletar funcionário.' });
        }
    }
}

export const staffController = new StaffController();