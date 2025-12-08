// ==============================================
// VALIDATION MIDDLEWARE (ZOD)
// ==============================================

import { z } from 'zod';
import { ValidationError } from './errorHandler.js';

/**
 * Middleware genérico de validação usando Zod
 */
export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            next(new ValidationError('Dados de entrada inválidos', errors));
        } else {
            next(error);
        }
    }
};

// ==============================================
// SCHEMAS DE VALIDAÇÃO - AUTH
// ==============================================

/**
 * Schema de validação de senha forte
 */
const passwordSchema = z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)');

/**
 * Schema de registro de usuário
 */
export const registerSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email é obrigatório',
            })
            .email('Email inválido')
            .toLowerCase()
            .trim(),
        password: passwordSchema,
        name: z
            .string()
            .min(2, 'Nome deve ter no mínimo 2 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres')
            .trim()
            .optional(),
        role: z
            .enum(['CLIENT', 'PROVIDER', 'ADMIN'], {
                errorMap: () => ({ message: 'Tipo de usuário inválido' }),
            })
            .optional(),
        referralCode: z.string().optional(),
    }),
});

/**
 * Schema de login
 */
export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email é obrigatório',
            })
            .email('Email inválido')
            .toLowerCase()
            .trim(),
        password: z.string({
            required_error: 'Senha é obrigatória',
        }),
    }),
});

/**
 * Schema de refresh token
 */
export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string({
            required_error: 'Refresh token é obrigatório',
        }),
    }),
});

// ==============================================
// SCHEMAS DE VALIDAÇÃO - BOOKING
// ==============================================

/**
 * Schema de criação de booking
 */
export const createBookingSchema = z.object({
    body: z.object({
        slotId: z
            .string({
                required_error: 'ID do horário é obrigatório',
            })
            .uuid('ID do horário inválido'),
    }),
});

/**
 * Schema de cancelamento de booking
 */
export const cancelBookingSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do agendamento inválido'),
    }),
});

/**
 * Schema de listagem de bookings
 */
export const listBookingsSchema = z.object({
    query: z.object({
        page: z
            .string()
            .regex(/^\d+$/, 'Página deve ser um número')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val > 0, 'Página deve ser maior que 0')
            .optional()
            .default('1'),
        limit: z
            .string()
            .regex(/^\d+$/, 'Limite deve ser um número')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val > 0 && val <= 100, 'Limite deve ser entre 1 e 100')
            .optional()
            .default('10'),
        status: z
            .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
            .optional(),
        startDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
            .optional(),
        endDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
            .optional(),
    }),
});

// ==============================================
// SCHEMAS DE VALIDAÇÃO - SERVICE
// ==============================================

/**
 * Schema de criação de serviço
 */
export const createServiceSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Nome do serviço é obrigatório',
            })
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres')
            .trim(),
        description: z
            .string()
            .max(500, 'Descrição deve ter no máximo 500 caracteres')
            .trim()
            .optional(),
        duration: z
            .number({
                required_error: 'Duração é obrigatória',
                invalid_type_error: 'Duração deve ser um número',
            })
            .int('Duração deve ser um número inteiro')
            .positive('Duração deve ser maior que 0')
            .max(480, 'Duração máxima é 480 minutos (8 horas)'),
        price: z
            .number({
                required_error: 'Preço é obrigatório',
                invalid_type_error: 'Preço deve ser um número',
            })
            .nonnegative('Preço não pode ser negativo')
            .max(999999.99, 'Preço máximo é R$ 999.999,99'),
    }),
});

/**
 * Schema de atualização de serviço
 */
export const updateServiceSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do serviço inválido'),
    }),
    body: z.object({
        name: z
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres')
            .trim()
            .optional(),
        description: z
            .string()
            .max(500, 'Descrição deve ter no máximo 500 caracteres')
            .trim()
            .optional(),
        duration: z
            .number()
            .int('Duração deve ser um número inteiro')
            .positive('Duração deve ser maior que 0')
            .max(480, 'Duração máxima é 480 minutos (8 horas)')
            .optional(),
        price: z
            .number()
            .nonnegative('Preço não pode ser negativo')
            .max(999999.99, 'Preço máximo é R$ 999.999,99')
            .optional(),
    }),
});

/**
 * Schema de deleção de serviço
 */
export const deleteServiceSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do serviço inválido'),
    }),
});

// ==============================================
// SCHEMAS DE VALIDAÇÃO - AVAILABILITY SLOT
// ==============================================

/**
 * Schema de criação de slot de disponibilidade
 */
export const createSlotSchema = z.object({
    body: z.object({
        serviceId: z
            .string({
                required_error: 'ID do serviço é obrigatório',
            })
            .uuid('ID do serviço inválido'),
        startAt: z
            .string({
                required_error: 'Data/hora de início é obrigatória',
            })
            .datetime('Data/hora inválida (use formato ISO 8601)'),
    }),
});

/**
 * Schema de criação em massa de slots
 */
export const bulkCreateSlotsSchema = z.object({
    body: z.object({
        serviceId: z
            .string({
                required_error: 'ID do serviço é obrigatório',
            })
            .uuid('ID do serviço inválido'),
        startDate: z
            .string({
                required_error: 'Data de início é obrigatória',
            })
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
        endDate: z
            .string({
                required_error: 'Data de fim é obrigatória',
            })
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
        daysOfWeek: z
            .array(
                z
                    .number()
                    .int()
                    .min(0, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
                    .max(6, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
            )
            .min(1, 'Selecione pelo menos um dia da semana'),
        startTime: z
            .string({
                required_error: 'Horário de início é obrigatório',
            })
            .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
        endTime: z
            .string({
                required_error: 'Horário de fim é obrigatório',
            })
            .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
    }),
});

/**
 * Schema de query de slots disponíveis
 */
export const getAvailableSlotsSchema = z.object({
    params: z.object({
        serviceId: z.string().uuid('ID do serviço inválido'),
    }),
    query: z.object({
        date: z
            .string({
                required_error: 'Data é obrigatória',
            })
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
    }),
});

// ==============================================
// SCHEMAS DE VALIDAÇÃO - USER
// ==============================================

/**
 * Schema de atualização de perfil de usuário
 */
export const updateUserProfileSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do usuário inválido'),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, 'Nome deve ter no mínimo 2 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres')
            .trim()
            .optional(),
        phone: z
            .string()
            .regex(
                /^\+?[1-9]\d{1,14}$/,
                'Telefone inválido (use formato internacional ou nacional)'
            )
            .optional(),
        avatar: z.string().url('URL do avatar inválida').optional(),
    }),
});

/**
 * Schema de mudança de senha
 */
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({
            required_error: 'Senha atual é obrigatória',
        }),
        newPassword: passwordSchema,
        confirmPassword: z.string({
            required_error: 'Confirmação de senha é obrigatória',
        }),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    }),
});

// ==============================================
// VALIDAÇÕES PERSONALIZADAS
// ==============================================

/**
 * Validador customizado para datas futuras
 */
export const futureDateValidator = z.string().refine(
    (date) => {
        const inputDate = new Date(date);
        const now = new Date();
        return inputDate > now;
    },
    {
        message: 'A data deve ser no futuro',
    }
);

/**
 * Validador customizado para horários
 */
export const timeRangeValidator = (startTime, endTime) => {
    return z.object({}).refine(
        () => {
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            return endTotalMinutes > startTotalMinutes;
        },
        {
            message: 'Horário de fim deve ser após o horário de início',
        }
    );
};
