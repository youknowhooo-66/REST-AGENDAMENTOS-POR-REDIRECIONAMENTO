import { prisma } from '../../config/prismaClient.js';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // Importando o Enum Role para segurança

class UserController {

    // READ (Listar todos os usuários)
    // TODO: Add role-based access control. Only ADMINs should be able to list all users.
    async getAll(req, res) {
        const { role } = req.user;

        if (role !== Role.ADMIN) {
            return res.status(403).json({ error: 'Apenas administradores podem listar todos os usuários.' });
        }
        try {
            const users = await prisma.user.findMany({
                select: { id: true, name: true, email: true, role: true },
            });
            return res.status(200).json(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao listar usuários.' });
        }
    }

    // READ (Buscar usuário por ID)
    // TODO: Add role-based access control. A user should only be able to get their own data, unless they are an ADMIN.
    async getById(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        if (role !== Role.ADMIN && userId !== id) {
            return res.status(403).json({ error: 'Você não tem permissão para visualizar este usuário.' });
        }
        try {
            const user = await prisma.user.findUnique({
                where: { id: id },
                select: { id: true, name: true, email: true, role: true },
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
    // TODO: Add role-based access control. A user should only be able to update their own data, unless they are an ADMIN.
    async update(req, res) {
        const { id } = req.params;
        const { name, email, password, role, phone, age } = req.body;
        const { userId, role: userRole } = req.user; // Renomear 'role' do req.user para 'userRole'
        let updateData = { name, email, phone }; // Inicializar com os campos que não precisam de tratamento especial

        // Permissão: Apenas ADMIN pode atualizar qualquer usuário, ou usuário pode atualizar a si mesmo
        if (userRole !== Role.ADMIN && userId !== id) {
            return res.status(403).json({ error: 'Você não tem permissão para atualizar este usuário.' });
        }

        // Restrição de atualização de role: Apenas ADMIN pode alterar roles
        if (role && userRole !== Role.ADMIN) {
            return res.status(403).json({ error: 'Você não tem permissão para alterar o papel (role) de um usuário.' });
        }
        
        try {
            // 1. Hash da nova senha, se fornecida
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            // 2. Tratar 'age'
            if (age !== undefined) {
                updateData.age = parseInt(age, 10);
                if (isNaN(updateData.age)) {
                    return res.status(400).json({ error: 'Idade deve ser um número válido.' });
                }
            }

            // 3. Validação e aplicação do Role (se fornecido e permitido)
            if (role && userRole === Role.ADMIN) { // Só aplica se for ADMIN
                if (!Object.values(Role).includes(role.toUpperCase())) {
                    return res.status(400).json({ error: 'Role inválido.' });
                }
                updateData.role = role.toUpperCase();
            } else if (role && userRole !== Role.ADMIN) {
                // Se um não-ADMIN tentar passar um 'role', ignoramos ou podemos retornar erro.
                // Já tratado pela checagem de permissão acima, mas bom para clareza.
                return res.status(403).json({ error: 'Você não tem permissão para alterar o papel (role) de um usuário.' });
            }

            // 4. Atualização no Prisma
            const updatedUser = await prisma.user.update({
                where: { id: id },
                data: updateData,
                select: { id: true, name: true, email: true, role: true, phone: true, age: true },
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
    // TODO: Add role-based access control. Only ADMINs should be able to delete users.
    async delete(req, res) {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== Role.ADMIN) {
            return res.status(403).json({ error: 'Apenas administradores podem deletar usuários.' });
        }
        try {
            await prisma.user.delete({
                where: { id: id },
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

    async updateProfile(req, res) {
        const { userId } = req.user;
        const { name, email, avatarUrl, providerName } = req.body;

        try {
            const updatedUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.update({
                    where: { id: userId },
                    data: {
                        name,
                        email,
                        avatarUrl,
                    },
                    include: {
                        provider: true,
                    },
                });

                if (user.role === Role.PROVIDER && providerName && user.provider) {
                    await tx.provider.update({
                        where: { id: user.provider.id },
                        data: {
                            name: providerName,
                        },
                    });
                }

                return user;
            });

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const userController = new UserController();