# 🔍 DIAGNÓSTICO COMPLETO DO PROJETO
## REST-AGENDAMENTOS-POR-REDIRECIONAMENTO

**Data da Análise:** 2025-12-04  
**Escopo:** Backend (Node.js + Express + Prisma) e Frontend (React + Vite + TailwindCSS)

---

## 📋 ÍNDICE

1. [Análise Geral](#análise-geral)
2. [Backend - Diagnóstico Detalhado](#backend---diagnóstico-detalhado)
3. [Frontend - Diagnóstico Detalhado](#frontend---diagnóstico-detalhado)
4. [Problemas Críticos Identificados](#problemas-críticos-identificados)
5. [Problemas Médios](#problemas-médios)
6. [Melhorias de Performance](#melhorias-de-performance)
7. [Plano de Refatoração](#plano-de-refatoração)
8. [Checklist de Correções](#checklist-de-correções)

---

## 📊 ANÁLISE GERAL

### Estrutura do Projeto

```
REST-AGENDAMENTOS-POR-REDIRECIONAMENTO/
├── back_/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controller/     # Controllers (MVC)
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares (auth, upload)
│   │   ├── services/       # Serviços (email, etc)
│   │   ├── config/         # Configurações
│   │   └── utils/          # Utilidades
│   ├── prisma/            # Schema do banco de dados
│   └── __tests__/         # Testes (parcialmente implementados)
│
└── front_/                # Frontend (React + Vite)
    ├── src/
    │   ├── components/    # Componentes reutilizáveis
    │   ├── pages/         # Páginas da aplicação
    │   ├── contexts/      # Context API (Auth, Theme)
    │   ├── hooks/         # Custom hooks
    │   ├── services/      # API calls
    │   └── layouts/       # Layouts compartilhados
    └── public/
```

### Stack Tecnológico

**Backend:**
- Node.js + Express
- Prisma ORM (SQLite/PostgreSQL)
- JWT (autenticação)
- Nodemailer (envio de emails)
- Google Generative AI (Gemini)
- Multer (upload de arquivos)

**Frontend:**
- React 19
- Vite
- TailwindCSS
- React Router DOM v7
- Axios
- React Toastify
- Recharts (gráficos)
- QRCode.react

---

## 🔴 BACKEND - DIAGNÓSTICO DETALHADO

### 1. **Problemas de Arquitetura**

#### 🐛 **Bug 1.1: Falta de Camada de Serviços**
**Severidade:** 🔴 Alta  
**Localização:** `src/controller/*`

**Problema:**
- Controllers estão fazendo queries diretas ao Prisma
- Lógica de negócio misturada com lógica de apresentação
- Violação do princípio Single Responsibility

**Exemplo Problemático:**
```javascript
// BookingController.js - Linha 7-65
async createBooking(req, res) {
    const { slotId } = req.body;
    const userId = req.user.userId;
    
    // ❌ Muita lógica dentro do controller
    const slot = await prisma.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { service: true }
    });
    
    // ❌ Validações no controller
    if (!slot) {
        return res.status(404).json({ error: 'Slot not found.' });
    }
    // ... mais 40+ linhas de lógica
}
```

**Solução:**
```javascript
// services/BookingService.js
class BookingService {
    async createBooking(userId, slotId) {
        // Validações
        const slot = await this.validateSlot(slotId);
        const user = await this.validateUser(userId);
        
        // Transação
        return await this.createBookingTransaction(user, slot);
    }
    
    async validateSlot(slotId) {
        const slot = await prisma.availabilitySlot.findUnique({
            where: { id: slotId },
            include: { service: true }
        });
        
        if (!slot) {
            throw new NotFoundError('Slot não encontrado');
        }
        
        if (slot.status !== SlotStatus.AVAILABLE) {
            throw new ValidationError('Slot não está disponível');
        }
        
        return slot;
    }
    
    async createBookingTransaction(user, slot) {
        return await prisma.$transaction(async (tx) => {
            // 1. Atualizar slot
            await tx.availabilitySlot.update({
                where: { id: slot.id },
                data: { status: SlotStatus.BOOKED }
            });
            
            // 2. Criar booking
            const booking = await tx.booking.create({
                data: {
                    userId: user.id,
                    slotId: slot.id,
                    status: BookingStatus.PENDING
                }
            });
            
            // 3. Enviar email (async, não bloqueia)
            this.sendConfirmationEmail(booking).catch(console.error);
            
            return booking;
        });
    }
}
```

**Controller Refatorado:**
```javascript
// BookingController.js
async createBooking(req, res) {
    try {
        const { slotId } = req.body;
        const userId = req.user.userId;
        
        const booking = await bookingService.createBooking(userId, slotId);
        
        return res.status(201).json(booking);
    } catch (error) {
        return handleControllerError(res, error);
    }
}
```

---

#### 🐛 **Bug 1.2: Falta de Tratamento de Erros Centralizado**
**Severidade:** 🔴 Alta  

**Problema:**
- Cada controller repete a mesma lógica de erro
- Mensagens de erro inconsistentes
- Sem logging estruturado

**Solução:**
```javascript
// middleware/errorHandler.js
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

// Middleware global de erro
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    // Log do erro
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode
        });
    }
    
    // Erros do Prisma
    if (err.code === 'P2002') {
        return res.status(409).json({
            status: 'error',
            message: 'Este registro já existe.',
            field: err.meta?.target?.[0]
        });
    }
    
    if (err.code === 'P2025') {
        return res.status(404).json({
            status: 'error',
            message: 'Registro não encontrado.'
        });
    }
    
    // Erro operacional (conhecido)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }
    
    // Erro desconhecido (não expor detalhes)
    return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor.'
    });
};
```

---

#### 🐛 **Bug 1.3: Falta de Validação de Entrada**
**Severidade:** 🔴 Alta  

**Problema:**
- Dados de entrada não são validados adequadamente
- Vulnerável a ataques de injeção
- Sem sanitização

**Solução com Zod:**
```javascript
// validators/bookingValidator.js
import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        slotId: z.string().uuid('ID do slot inválido'),
    })
});

export const cancelBookingSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do agendamento inválido')
    })
});

// middleware/validate.js
export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validação falhou',
            errors: error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }
};

// Uso nas rotas
router.post('/', 
    auth, 
    validate(createBookingSchema),
    bookingController.createBooking
);
```

---

### 2. **Problemas de Segurança**

#### 🐛 **Bug 2.1: CORS Mal Configurado**
**Severidade:** 🟡 Média  
**Localização:** `app.js:18`

**Problema:**
```javascript
app.use(cors()); // ❌ Aceita requisições de qualquer origem
```

**Solução:**
```javascript
// config/cors.js
export const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://seudominio.com'] 
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 horas
};

// app.js
import { corsOptions } from './config/cors.js';
app.use(cors(corsOptions));
```

---

#### 🐛 **Bug 2.2: Tokens JWT Sem Expiração Curta**
**Severidade:** 🟡 Média  
**Localização:** `utils/jwt.js`

**Problema:**
- Access tokens podem ter vida longa demais
- Sem rotação de refresh tokens

**Solução:**
```javascript
// utils/jwt.js
export const signAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m', // ✅ Curto para segurança
        issuer: 'seu-app',
        algorithm: 'HS256'
    });
};

export const signRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
        issuer: 'seu-app',
        algorithm: 'HS256'
    });
};

// Implementar rotação de refresh tokens
export const rotateRefreshToken = async (oldToken) => {
    // Invalidar token antigo
    await prisma.token.update({
        where: { token: oldToken },
        data: { revoked: true }
    });
    
    // Criar novo token
    const payload = verifyRefresh(oldToken);
    const newRefreshToken = signRefreshToken(payload);
    
    await prisma.token.create({
        data: {
            token: newRefreshToken,
            type: TokenType.REFRESH,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userId: payload.userId
        }
    });
    
    return newRefreshToken;
};
```

---

#### 🐛 **Bug 2.3: Senhas Sem Política de Força**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// validators/authValidator.js
const passwordSchema = z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Email inválido'),
        password: passwordSchema,
        name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
        role: z.enum(['CLIENT', 'PROVIDER', 'ADMIN']).optional()
    })
});
```

---

### 3. **Problemas de Performance**

#### 🐛 **Bug 3.1: N+1 Queries**
**Severidade:** 🔴 Alta  

**Problema:**
```javascript
// ❌ Problema N+1
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
    const slot = await prisma.slot.findUnique({ 
        where: { id: booking.slotId } 
    });
    // ...
}
```

**Solução:**
```javascript
// ✅ Usar include/select do Prisma
const bookings = await prisma.booking.findMany({
    include: {
        slot: {
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        },
        user: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
    }
});
```

---

#### 🐛 **Bug 3.2: Falta de Cache**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// utils/cache.js
import NodeCache from 'node-cache';

const cache = new NodeCache({
    stdTTL: 300, // 5 minutos
    checkperiod: 60
});

export const cacheMiddleware = (duration) => (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cached = cache.get(key);
    
    if (cached) {
        return res.json(cached);
    }
    
    res.originalJson = res.json;
    res.json = (body) => {
        cache.set(key, body, duration);
        res.originalJson(body);
    };
    
    next();
};

// Uso
router.get('/services', 
    cacheMiddleware(300), // 5 minutos
    serviceController.getAll
);
```

---

#### 🐛 **Bug 3.3: Envio de Email Bloqueando Requisições**
**Severidade:** 🔴 Alta  
**Localização:** `controller/Booking/BookingController.js`

**Problema:**
```javascript
// ❌ Email bloqueia a resposta
const booking = await createBooking();
await sendConfirmationEmail(booking); // Espera envio
return res.json(booking);
```

**Solução:**
```javascript
// ✅ Email assíncrono com fila
import { Queue } from 'bullmq';

const emailQueue = new Queue('emails', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

// Controller
const booking = await createBooking();
emailQueue.add('confirmation', { bookingId: booking.id });
return res.json(booking); // Resposta imediata

// Worker separado (worker.js)
const worker = new Worker('emails', async (job) => {
    if (job.name === 'confirmation') {
        const booking = await getBookingById(job.data.bookingId);
        await sendConfirmationEmail(booking);
    }
});
```

---

### 4. **Problemas de Código**

#### 🐛 **Bug 4.1: Uso de Classe Desnecessária em AuthController**
**Severidade:** 🟢 Baixa  

**Problema:**
```javascript
class AuthController {
    constructor() { } // ❌ Construtor vazio
    
    async register(req, res) { /* ... */ }
}

export const authController = new AuthController();
```

**Solução:**
```javascript
// ✅ Exportar funções diretamente
export const register = async (req, res) => {
    // ...
};

export const login = async (req, res) => {
    // ...
};
```

---

#### 🐛 **Bug 4.2: Falta de Paginação**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// utils/pagination.js
export const paginate = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    return { skip, take: limit, page, limit };
};

// Controller
const { skip, take, page, limit } = paginate(req.query);

const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.count()
]);

return res.json({
    data: bookings,
    meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    }
});
```

---

## 🔵 FRONTEND - DIAGNÓSTICO DETALHADO

### 1. **Problemas de Arquitetura**

#### 🐛 **Bug F1.1: Componentes Muito Grandes**
**Severidade:** 🔴 Alta  
**Localização:** `pages/Scheduling/Scheduling.jsx` (415 linhas)

**Problema:**
- Componente com múltiplas responsabilidades
- Difícil de testar e manter
- Estado complexo demais

**Solução:** [Já implementada no arquivo refatorado]
- Separar em componentes menores
- Criar custom hooks
- Extrair constantes e helpers

---

#### 🐛 **Bug F1.2: Dependências Desatualizadas em useEffect**
**Severidade:** 🟡 Média  

**Problema:**
```javascript
useEffect(() => {
    // ...
}, [selectedService, selectedDate, fetchAvailableSlots, availableSlots]);
// ❌ availableSlots causa re-render infinito
```

**Solução:**
```javascript
// ✅ Usar useCallback para funções
const fetchSlots = useCallback(async (serviceId, date) => {
    // ...
}, []); // Sem dependências que mudam

useEffect(() => {
    if (selectedService && selectedDate && !availableSlots[selectedDate]) {
        fetchSlots(selectedService.id, selectedDate);
    }
}, [selectedService, selectedDate]); // Remover availableSlots
```

---

#### 🐛 **Bug F1.3: Falta de Error Boundary**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// components/ErrorBoundary/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Enviar para serviço de monitoramento
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-page">
                    <h1>Algo deu errado</h1>
                    <button onClick={() => window.location.reload()}>
                        Recarregar página
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// App.jsx
<ErrorBoundary>
    <App />
</ErrorBoundary>
```

---

### 2. **Problemas de Performance**

#### 🐛 **Bug F2.1: Re-renders Desnecessários**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// ✅ Usar React.memo para componentes puros
const ServiceCard = React.memo(({ service, onSelectService }) => {
    return (
        <div onClick={() => onSelectService(service)}>
            {/* ... */}
        </div>
    );
});

// ✅ Usar useMemo para cálculos custosos
const sortedSlots = useMemo(() => {
    return slots.sort((a, b) => 
        new Date(a.startAt) - new Date(b.startAt)
    );
}, [slots]);
```

---

#### 🐛 **Bug F2.2: Requisições Duplicadas**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// hooks/useApi.js
import { useRef } from 'react';

export const useApi = () => {
    const cancelTokenSource = useRef();
    
    const request = async (method, url, data) => {
        // Cancelar requisição anterior
        if (cancelTokenSource.current) {
            cancelTokenSource.current.cancel('Nova requisição iniciada');
        }
        
        cancelTokenSource.current = axios.CancelToken.source();
        
        try {
            const response = await api[method](url, data, {
                cancelToken: cancelTokenSource.current.token
            });
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Requisição cancelada:', error.message);
            } else {
                throw error;
            }
        }
    };
    
    return { request };
};
```

---

#### 🐛 **Bug F2.3: Bundle Muito Grande**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// vite.config.js
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['react-toastify', 'recharts'],
                }
            }
        }
    },
    // Code splitting automático
    chunkSizeWarningLimit: 1000
});

// Lazy loading de rotas
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Scheduling = lazy(() => import('./pages/Scheduling/Scheduling'));

<Suspense fallback={<LoadingSpinner />}>
    <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scheduling" element={<Scheduling />} />
    </Routes>
</Suspense>
```

---

### 3. **Problemas de UX**

#### 🐛 **Bug F3.1: Falta de Loading States Consistentes**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// hooks/useAsyncOperation.js
export const useAsyncOperation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const execute = async (asyncFn) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await asyncFn();
            return result;
        } catch (err) {
            setError(err);
            toast.error(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    return { loading, error, execute };
};

// Uso
const { loading, execute } = useAsyncOperation();

const handleSubmit = () => {
    execute(async () => {
        await api.post('/bookings', data);
    });
};

{loading && <Skeleton />}
```

---

#### 🐛 **Bug F3.2: Acessibilidade Limitada**
**Severidade:** 🟡 Média  

**Solução:**
```javascript
// Adicionar ARIA labels
<button
    aria-label={`Selecionar horário ${formatTime(slot.startAt)}`}
    aria-pressed={selectedSlot?.id === slot.id}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            onSlotSelect(slot);
        }
    }}
>
    {formatTime(slot.startAt)}
</button>

// Adicionar skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
    Pular para conteúdo principal
</a>

// Melhorar contraste de cores
// Usar ferramentas como axe-core para testes
```

---

## 🔥 PROBLEMAS CRÍTICOS IDENTIFICADOS

### Prioridade 1 (Corrigir Imediatamente)

1. **Falta de Validação de Entrada** → Vulnerabilidade de segurança
2. **N+1 Queries** → Performance ruim
3. **Emails Bloqueando Requisições** → UX ruim
4. **CORS Mal Configurado** → Segurança
5. **Componentes Muito Grandes** → Manutenibilidade

### Prioridade 2 (Corrigir em Breve)

1. Falta de Cache
2. Bundle grande no frontend
3. Falta de Error Boundary
4. Falta de paginação
5. Re-renders desnecessários

### Prioridade 3 (Melhorias)

1. Acessibilidade
2. Testes automatizados
3. Documentação
4. Logging estruturado
5. Monitoramento

---

## 📈 MELHORIAS DE PERFORMANCE

### Backend

```javascript
// 1. Usar índices no banco de dados
model Booking {
    @@index([userId, status])
    @@index([createdAt])
}

// 2. Implementar compressão
import compression from 'compression';
app.use(compression());

// 3. Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100
});

app.use('/api/', limiter);
```

### Frontend

```javascript
// 1. Virtualização de listas longas
import { FixedSizeList } from 'react-window';

<FixedSizeList
    height={600}
    itemCount={slots.length}
    itemSize={50}
>
    {SlotRow}
</FixedSizeList>

// 2. Debounce em buscas
import { useDebouncedValue } from './hooks/useDebounce';

const debouncedSearch = useDebouncedValue(searchTerm, 500);

useEffect(() => {
    search(debouncedSearch);
}, [debouncedSearch]);

// 3. React Query para cache de dados
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000 // 5 minutos
});
```

---

## ✅ CHECKLIST DE CORREÇÕES

### Backend

- [ ] Implementar camada de serviços
- [ ] Adicionar tratamento de erros centralizado
- [ ] Implementar validação com Zod
- [ ] Configurar CORS adequadamente
- [ ] Adicionar rate limiting
- [ ] Implementar cache (Redis)
- [ ] Criar fila de emails (BullMQ)
- [ ] Adicionar paginação em todas as listagens
- [ ] Otimizar queries (evitar N+1)
- [ ] Adicionar índices no banco de dados
- [ ] Implementar logging estruturado (Winston)
- [ ] Adicionar compressão de respostas
- [ ] Criar testes unitários (>80% coverage)
- [ ] Criar testes de integração
- [ ] Documentar API (Swagger/OpenAPI)
- [ ] Implementar health checks
- [ ] Adicionar variáveis de ambiente (.env.example)

### Frontend

- [ ] Refatorar componentes grandes
- [ ] Criar custom hooks reutilizáveis
- [ ] Adicionar Error Boundary
- [ ] Implementar lazy loading de rotas
- [ ] Otimizar bundle (code splitting)
- [ ] Adicionar React Query para cache
- [ ] Implementar virtualização para listas longas
- [ ] Melhorar acessibilidade (ARIA, keyboard navigation)
- [ ] Adicionar testes com Jest + React Testing Library
- [ ] Implementar testes E2E (Playwright/Cypress)
- [ ] Otimizar re-renders (React.memo, useMemo)
- [ ] Adicionar PWA capabilities
- [ ] Implementar skeleton screens
- [ ] Melhorar tratamento de erros
- [ ] Adicionar analytics (opcional)

---

## 📚 PRÓXIMOS PASSOS

1. **Implementar correções críticas** (Prioridade 1)
2. **Criar suite de testes** (Backend e Frontend)
3. **Documentar código e API**
4. **Configurar CI/CD**
5. **Monitoramento e logging em produção**

---

**Documento gerado automaticamente - Análise completa do projeto**
