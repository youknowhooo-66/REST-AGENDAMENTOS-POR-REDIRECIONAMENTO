// ==============================================
// ERROR HANDLING MIDDLEWARE
// ==============================================

/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erro 404 - Recurso não encontrado
 */
export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado') {
        super(message, 404);
    }
}

/**
 * Erro 400 - Validação falhou
 */
export class ValidationError extends AppError {
    constructor(message = 'Dados inválidos', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * Erro 401 - Não autenticado
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Não autorizado. Faça login para continuar.') {
        super(message, 401);
    }
}

/**
 * Erro 403 - Sem permissão
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Você não tem permissão para realizar esta ação') {
        super(message, 403);
    }
}

/**
 * Erro 409 - Conflito
 */
export class ConflictError extends AppError {
    constructor(message = 'Conflito. Este recurso já existe.') {
        super(message, 409);
    }
}

/**
 * Erro 429 - Muitas requisições
 */
export class TooManyRequestsError extends AppError {
    constructor(message = 'Muitas requisições. Tente novamente mais tarde.') {
        super(message, 429);
    }
}

/**
 * Tratador de erros do Prisma
 */
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002': // Unique constraint violation
            const field = error.meta?.target?.[0] || 'campo';
            return new ConflictError(`Este ${field} já está em uso.`);

        case 'P2025': // Record not found
            return new NotFoundError('Registro não encontrado.');

        case 'P2003': // Foreign key constraint violation
            return new ValidationError('Não é possível realizar esta operação. Existem registros dependentes.');

        case 'P2014': // Relation violation
            return new ValidationError('Violação de relacionamento entre registros.');

        case 'P2000': // Value too long
            return new ValidationError('Um ou mais valores excedem o tamanho máximo permitido.');

        case 'P2011': // Null constraint violation
            return new ValidationError('Um campo obrigatório não foi fornecido.');

        case 'P2012': // Missing required value
            return new ValidationError('Valor obrigatório faltando.');

        case 'P2013': // Missing required argument
            return new ValidationError('Argumento obrigatório faltando.');

        default:
            console.error('Erro do Prisma não tratado:', error.code, error.message);
            return new AppError('Erro ao processar operação no banco de dados.', 500, false);
    }
};

/**
 * Tratador de erros do JWT
 */
const handleJWTError = () => {
    return new UnauthorizedError('Token inválido. Faça login novamente.');
};

/**
 * Tratador de erros de token expirado
 */
const handleJWTExpiredError = () => {
    return new UnauthorizedError('Sua sessão expirou. Faça login novamente.');
};

/**
 * Logger de erros (production)
 */
const logError = (err, req) => {
    const logData = {
        timestamp: new Date().toISOString(),
        error: {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        },
        user: req.user ? { id: req.user.userId, email: req.user.email } : null,
    };

    // Em produção, enviar para serviço de logging (Sentry, LogRocket, etc)
    console.error('[ERROR]', JSON.stringify(logData, null, 2));
};

/**
 * Enviar erro para o cliente (development)
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack,
        errors: err.errors || undefined,
    });
};

/**
 * Enviar erro para o cliente (production)
 */
const sendErrorProd = (err, res) => {
    // Erro operacional (confiável) - enviar mensagem ao cliente
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errors: err.errors || undefined,
        });
    } else {
        // Erro de programação ou desconhecido - não vazar detalhes
        console.error('ERRO NÃO OPERACIONAL:', err);

        res.status(500).json({
            status: 'error',
            message: 'Algo deu errado. Por favor, tente novamente mais tarde.',
        });
    }
};

/**
 * Middleware global de tratamento de erros
 * Deve ser o último middleware no app.js
 */
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log do erro
    if (process.env.NODE_ENV === 'production') {
        logError(err, req);
    }

    // Criar cópia do erro
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Tratar erros específicos
    if (err.name === 'PrismaClientKnownRequestError') {
        error = handlePrismaError(err);
    }

    if (err.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
        error = handleJWTExpiredError();
    }

    if (err.name === 'ValidationError') {
        error = new ValidationError(err.message, err.errors);
    }

    // Enviar resposta apropriada
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

/**
 * Wrapper para funções async (evita try-catch em controllers)
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Helper para validar e retornar erros de forma consistente
 */
export const handleControllerError = (res, error) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            errors: error.errors || undefined,
        });
    }

    console.error('Erro não tratado:', error);
    return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor.',
    });
};

/**
 * Middleware para rotas não encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Rota ${req.originalUrl} não encontrada`);
    next(error);
};
