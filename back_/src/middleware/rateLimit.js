// ==============================================
// RATE LIMITING MIDDLEWARE
// ==============================================

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter geral para todas as rotas da API
 * 100 requisições por 15 minutos por IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por janela
    message: {
        status: 'error',
        message: 'Muitas requisições deste IP. Tente novamente mais tarde.',
    },
    standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Muitas requisições. Por favor, aguarde antes de tentar novamente.',
        });
    },
});

/**
 * Rate limiter estrito para rotas de autenticação
 * 5 tentativas de login por 15 minutos por IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 tentativas
    message: {
        status: 'error',
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
    skipSuccessfulRequests: false, // Conta requisições bem-sucedidas também
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
        });
    },
});

/**
 * Rate limiter para criação de recursos
 * 20 criações por hora
 */
export const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 criações
    message: {
        status: 'error',
        message: 'Limite de criações excedido. Tente novamente mais tarde.',
    },
});

/**
 * Rate limiter para rotas públicas
 * 60 requisições por 15 minutos
 */
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 60, // 60 requisições
    message: {
        status: 'error',
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
    },
});
