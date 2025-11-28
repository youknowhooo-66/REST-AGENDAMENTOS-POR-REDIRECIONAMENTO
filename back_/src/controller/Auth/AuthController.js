// AuthController.js (Usando Prisma Singleton)
import {prisma}  from '../../config/prismaClient.js';
import pkg from '@prisma/client';
const { TokenType, Role } = pkg; // <-- Importa APENAS os Enums

import bcrypt from "bcrypt";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefresh,
} from "../../utils/jwt.js";


class AuthController {
    
    constructor() { }

    async register(
        req,
        res
    ) {
        try {
            const { email, password, name, role, referralCode } = req.body; 
            
            if (!email || !password) { // Name is now optional for initial registration
                return res.status(400).json({ error: "Email e senha são obrigatórios" });
            }
            
            const existingUser = await prisma.user.findUnique({ // Usa a instância importada
                where: { email },
            });
            
            if (existingUser) {
                return res.status(409).json({ error: "Usuário já existe" });
            }
            
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const user = await prisma.user.create({ // Usa a instância importada
                data: { 
                    email, 
                    password: hashedPassword, 
                    name: name || 'Novo Cliente', // Provide a default name if not supplied
                    role: role && role.toUpperCase() in Role ? role.toUpperCase() : Role.CLIENT,
                    referralCode: referralCode || null, // Store referralCode if provided
                },
                select: { id: true, email: true, name: true, role: true },
            });

            // Se o usuário for um PROVEDOR, criar automaticamente o registro na tabela Provider
            if (user.role === Role.PROVIDER) {
                await prisma.provider.create({
                    data: {
                        name: user.name,
                        ownerId: user.id,
                    },
                });
            }
            
            return res.status(201).json(user);
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Este email já está em uso.' });
            }
            console.error("Erro no registro:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    };

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Usa a instância importada
            const user = await prisma.user.findUnique({ where: { email } }); 

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: "Credenciais inválidas" });
            }
            
            // Gerar tokens...
            const accessToken = signAccessToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
            const refreshToken = signRefreshToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
            
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            
            await prisma.token.create({ // Usa a instância importada
                data: {
                    token: refreshToken,
                    type: TokenType.REFRESH,
                    expiresAt,
                    user: { connect: { id: user.id } },
                },
            });
            
            res.status(200).json({
                accessToken,
                refreshToken,
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
            });
        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    };
    
    async refresh(req, res) {
        const { refreshToken } = req.body;
        const storedRefreshToken = await prisma.token.findFirst({ where: { token: refreshToken } }); // Usa a instância importada
        
        if (
            !storedRefreshToken ||
            storedRefreshToken.revoked ||
            storedRefreshToken.expiresAt < new Date()
        )
            return res.status(401).json({ error: "invalid refresh token" });

        try {
            const payload = verifyRefresh(refreshToken);
            const accessToken = signAccessToken({ userId: payload.userId, email: payload.email, nome: payload.nome });
            return res.json({ accessToken });
        } catch {
            return res.status(401).json({ error: "invalid refresh token" });
        }
    };

    async logout(req, res) {
        const { refreshToken } = req.body;
        try {
            const storedRefreshToken = await prisma.token.findFirst({ where: { token: refreshToken } }); // Usa a instância importada
            
            if (
                !storedRefreshToken ||
                storedRefreshToken.revoked ||
                storedRefreshToken.expiresAt < new Date()
            )
                return res.status(401).json({ error: "invalid refresh token" });

            await prisma.token.updateMany({ // Usa a instância importada
                where: { id: storedRefreshToken.id },
                data: { revoked: true },
            });
        } catch (error) {
            console.error("Erro no logout:", error);
        }

        return res.status(200).json("Usuário deslogado!");
    }
}


export const authController = new AuthController();