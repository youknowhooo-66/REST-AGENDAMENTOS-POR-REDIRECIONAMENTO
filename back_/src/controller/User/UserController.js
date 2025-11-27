import  {prisma}  from '../../config/prismaClient.js';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // Importando o Enum Role para segurança

class UserController {
    
    // READ (Listar todos os usuários)
    async getAll(req, res) {
        try {
            const users = await prisma.user.findMany({
                select: { id: true, name: true, email: true, phone: true, role: true },
            });
            return res.status(200).json(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao listar usuários.' });
        }
    }

    // READ (Buscar usuário por ID)
    async getById(req, res) {
        const { id } = req.params;
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                select: { id: true, name: true, email: true, phone: true, role: true, appointments: true },
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            return res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // UPDATE
    async update(req, res) {
        const { id } = req.params;
        const { name, email, phone, password, role } = req.body;
        let updateData = { name, email, phone, role };

        try {
            // 1. Hash da nova senha, se fornecida
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }
            
            // 2. Validação do Role (para garantir que só roles válidos sejam inseridos)
            if (role && !Object.values(Role).includes(role.toUpperCase())) {
                 return res.status(400).json({ error: 'Role inválido.' });
            }
            if (role) {
                updateData.role = role.toUpperCase();
            }

            // 3. Atualização no Prisma
            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id) },
                data: updateData,
                select: { id: true, name: true, email: true, phone: true, role: true },
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            // Captura erro de email duplicado ou ID não encontrado
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Este email já está em uso.' });
            }
            if (error.code === 'P2025') {
                 return res.status(404).json({ error: 'Usuário não encontrado para atualizar.' });
            }
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao atualizar usuário.' });
        }
    }

    // DELETE
    async delete(req, res) {
        const { id } = req.params;
        try {
            await prisma.user.delete({
                where: { id: parseInt(id) },
            });
            return res.status(204).send(); // 204 No Content para sucesso na exclusão
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Usuário não encontrado para exclusão.' });
            }
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao deletar usuário.' });
        }
    }
}

export const userController = new UserController();