# 🚀 GUIA DE IMPLEMENTAÇÃO - MELHORIAS E CORREÇÕES

## Implementação Passo a Passo das Correções

---

## FASE 1: CONFIGURAÇÃO E DEPENDÊNCIAS (30 min)

### Backend

```bash
cd back_

# Instalar novas dependências
npm install zod
npm install --save-dev @types/jest @types/supertest

# Criar .env.example
cp .env .env.example
```

**Adicionar ao `.env.example`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET=your_jwt_secret_here_min_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_characters

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Environment
NODE_ENV=development
PORT=3000

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd front_

# Instalar dependências de teste
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Adicionar ao package.json
```

**Atualizar `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Criar `vitest.config.js`:**
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
```

**Criar `src/setupTests.js`:**
```javascript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

---

## FASE 2: BACKEND - CAMADA DE ERROS (1 hora)

### Passo 1: Copiar arquivo de erro handler

O arquivo já foi criado em:
`back_/src/middleware/errorHandler.js`

### Passo 2: Atualizar app.js

**Editar `back_/src/app.js`:**

```javascript
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js'; // NOVO
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'; // NOVO
// ... outros imports

const app = express();
app.use(express.json());
app.use(cors(corsOptions)); // ATUALIZADO

// ... rotas existentes ...

// ⚠️ IMPORTANTE: Adicionar DEPOIS de todas as rotas
app.use(notFoundHandler); // 404
app.use(errorHandler);    // Tratador global de erros

export { app };
```

### Passo 3: Criar configuração de CORS

**Criar `back_/src/config/cors.js`:**

```javascript
export const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 horas
};
```

---

## FASE 3: BACKEND - VALIDAÇÃO (1.5 horas)

### Passo 1: Copiar middleware de validação

O arquivo já foi criado em:
`back_/src/middleware/validation.js`

### Passo 2: Atualizar rotas com validação

**Exemplo: `back_/src/routes/authBooking.js`**

```javascript
import { Router } from 'express';
import { bookingController } from '../controller/Booking/BookingController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { 
    createBookingSchema,
    cancelBookingSchema,
    listBookingsSchema
} from '../middleware/validation.js';

const router = Router();

// Criar booking (com validação)
router.post('/', 
    auth,
    validate(createBookingSchema),
    bookingController.createBooking
);

// Listar bookings (com validação de query params)
router.get('/',
    auth,
    validate(listBookingsSchema),
    bookingController.getClientBookings
);

// Cancelar booking (com validação de params)
router.delete('/:id',
    auth,
    validate(cancelBookingSchema),
    bookingController.cancelBooking
);

export { router as bookingRouter };
```

### Passo 3: Repetir para todas as rotas

Aplicar validações em:
- `authRoutes.js` (login, register)
- `authService.js` (create, update service)
- `authAvailabilitySlot.js` (create slots)
- `authUser.js` (update profile)

---

## FASE 4: BACKEND - CAMADA DE SERVIÇOS (2 horas)

### Passo 1: Copiar arquivo de serviços

O arquivo já foi criado em:
`back_/src/services/businessServices.js`

### Passo 2: Refatorar BookingController

**Editar `back_/src/controller/Booking/BookingController.js`:**

```javascript
import { catchAsync } from '../middleware/errorHandler.js';
import { bookingService } from '../services/businessServices.js';

// Criar booking (refatorado)
export const createBooking = catchAsync(async (req, res) => {
    const { slotId } = req.body;
    const userId = req.user.userId;
    
    const booking = await bookingService.createBooking(userId, slotId);
    
    res.status(201).json(booking);
});

// Cancelar booking (refatorado)
export const cancelBooking = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const booking = await bookingService.cancelBooking(id, userId, userRole);
    
    res.status(200).json(booking);
});

// Listar bookings do cliente (refatorado)
export const getClientBookings = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };
    
    const result = await bookingService.getClientBookings(userId, options);
    
    res.status(200).json(result);
});

// Listar bookings do provedor (refatorado)
export const getProviderBookings = catchAsync(async (req, res) => {
    // Buscar providerId do usuário
    const provider = await prisma.provider.findUnique({
        where: { ownerId: req.user.userId }
    });
    
    if (!provider) {
        throw new NotFoundError('Provedor não encontrado');
    }
    
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        serviceId: req.query.serviceId,
    };
    
    const result = await bookingService.getProviderBookings(provider.id, options);
    
    res.status(200).json(result);
});
```

### Passo 3: Atualizar exports

**Atualizar `back_/src/controller/Booking/BookingController.js`:**

```javascript
// Remover classe, exportar functions diretamente
export {
    createBooking,
    cancelBooking,
    getClientBookings,
    getProviderBookings,
    providerCancelBooking
};
```

**Atualizar todas as rotas que usam o controller:**

```javascript
// ANTES
import { bookingController } from '../controller/Booking/BookingController.js';
router.post('/', auth, bookingController.createBooking);

// DEPOIS
import * as bookingController from '../controller/Booking/BookingController.js';
router.post('/', auth, validate(createBookingSchema), bookingController.createBooking);
```

---

## FASE 5: FRONTEND - REFATORAÇÃO (2 horas)

### Passo 1: Substituir Scheduling.jsx

```bash
cd front_/src/pages/Scheduling
mv Scheduling.jsx Scheduling.old.jsx
mv Scheduling.refactored.jsx Scheduling.jsx
```

### Passo 2: Verificar e corrigir imports

Verifique se todos os componentes importados existem:
- `BookingForm`
- `ServiceCard`
- `RegisterModal`
- `ClientDetailsModal`
- `ShareBookingModal`

### Passo 3: Testar funcionamento

```bash
npm run dev
```

Acesse `http://localhost:5173/scheduling` e teste:
1. Listagem de serviços
2. Seleção de serviço
3. Seleção de data
4. Seleção de horário
5. Criação de booking

---

## FASE 6: TESTES AUTOMATIZADOS (3 horas)

### Backend

**1. Configurar Jest** 

Já existe `jest.config.js`. Verificar:

```javascript
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
};
```

**2. Copiar testes**

O arquivo de teste já foi criado em:
`back_/__tests__/bookingService.test.js`

**3. Rodar testes**

```bash
cd back_
npm test
```

### Frontend

**1. Copiar testes**

O arquivo já foi criado em:
`front_/src/pages/Scheduling/__tests__/Scheduling.test.jsx`

**2. Rodar testes**

```bash
cd front_
npm test
```

**3. Ver cobertura**

```bash
npm run test:coverage
```

---

## FASE 7: OTIMIZAÇÕES DE PERFORMANCE (2 horas)

### Backend

**1. Adicionar índices no Prisma**

**Editar `back_/prisma/schema.prisma`:**

```prisma
model Booking {
  id        String   @id @default(uuid())
  userId    String
  slotId    String
  status    BookingStatus @default(PENDING)
  createdAt DateTime @default(now())
  
  // Índices para melhorar performance
  @@index([userId, status])
  @@index([createdAt])
  @@index([slotId])
}

model AvailabilitySlot {
  id        String   @id @default(uuid())
  serviceId String
  startAt   DateTime
  status    SlotStatus @default(AVAILABLE)
  
  // Índices
  @@index([serviceId, status])
  @@index([startAt])
}
```

**Aplicar migração:**

```bash
cd back_
npx prisma migrate dev --name add_indexes
```

**2. Adicionar compressão**

```bash
npm install compression
```

**Editar `back_/src/app.js`:**

```javascript
import compression from 'compression';

app.use(compression());
```

**3. Rate Limiting**

```bash
npm install express-rate-limit
```

**Criar `back_/src/middleware/rateLimit.js`:**

```javascript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por IP
    message: 'Muitas requisições. Tente novamente mais tarde.',
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 tentativas de login
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
});
```

**Aplicar em `app.js`:**

```javascript
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### Frontend

**1. Code Splitting**

**Editar `front_/src/App.jsx`:**

```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Scheduling = lazy(() => import('./pages/Scheduling/Scheduling'));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));

function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scheduling" element={<Scheduling />} />
            </Routes>
        </Suspense>
    );
}
```

**2. Otimizar Bundle**

**Editar `front_/vite.config.js`:**

```javascript
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['react-toastify', 'recharts'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
```

---

## FASE 8: DOCUMENTAÇÃO (1 hora)

### Backend - API Documentation

**Criar `back_/API_DOCUMENTATION.md`:**

```markdown
# API Documentation

## Authentication

### POST /api/auth/register
Registra novo usuário

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "CLIENT"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CLIENT"
}
```

### POST /api/auth/login
Faz login

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }
}
```

## Bookings

### POST /api/bookings
Cria novo agendamento

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "slotId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "slotId": "uuid",
  "status": "PENDING",
  "slot": {
    "startAt": "2025-12-05T10:00:00Z",
    "service": {
      "name": "Corte de Cabelo"
    }
  }
}
```

### GET /api/bookings
Lista agendamentos do cliente

**Query Params:**
- `page` (optional): número da página (default: 1)
- `limit` (optional): itens por página (default: 10)
- `status` (optional): PENDING | CONFIRMED | CANCELLED | COMPLETED
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response (200):**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

// ... continuar para todos os endpoints
```

---

## FASE 9: TESTING & QA (2 horas)

### Checklist de Testes Manuais

**Backend:**
- [ ] Registro de novo usuário
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas (deve falhar)
- [ ] Criar serviço (provider)
- [ ] Criar slots de disponibilidade
- [ ] Criar booking (cliente autenticado)
- [ ] Criar booking sem autenticação (deve falhar)
- [ ] Cancelar booking próprio
- [ ] Cancelar booking de outro usuário (deve falhar)
- [ ] Listar bookings com paginação
- [ ] Testar validações (emails inválidos, etc)

**Frontend:**
- [ ] Navegação entre páginas
- [ ] Login/Logout
- [ ] Registro de novo usuário
- [ ] Seleção de serviço
- [ ] Seleção de data
- [ ] Seleção de horário
- [ ] Confirmação de booking
- [ ] Visualização de agendamentos
- [ ] Cancelamento de agendamento
- [ ] Responsividade (mobile, tablet, desktop)
- [ ] Dark mode
- [ ] Acessibilidade (navegação por teclado)

### Testes Automatizados

```bash
# Backend
cd back_
npm test

# Frontend  
cd front_
npm test

# Cobertura
npm run test:coverage
```

**Meta de Cobertura:**
- Backend: >80%
- Frontend: >70%

---

## FASE 10: DEPLOY PREPARATION (1 hora)

### Variáveis de Ambiente

**Criar `.env.production` no backend:**

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=https://seu-dominio.com
```

### Build

**Backend:**
```bash
cd back_
npm run build
```

**Frontend:**
```bash
cd front_
npm run build
```

### Docker (Opcional)

**Criar `Dockerfile` no backend:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

**Criar `docker-compose.yml`:**

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: agendamentos
    ports:
      - "5432:5432"
      
  backend:
    build: ./back_
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/agendamentos
      
  frontend:
    build: ./front_
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## CHECKLIST FINAL

### Correções Implementadas

- [✅] Camada de tratamento de erros
- [✅] Validação de entrada com Zod
- [✅] Camada de serviços (business logic)
- [✅] CORS configurado corretamente
- [✅] Refatoração do componente Scheduling
- [✅] Testes automatizados (backend e frontend)
- [ ] Rate limiting
- [ ] Compressão
- [ ] Índices no banco de dados
- [ ] Code splitting no frontend
- [ ] Documentação da API
- [ ] CI/CD pipeline

### Melhorias de Performance

- [ ] Cache (Redis) - opcional
- [ ] Fila de emails (BullMQ) - opcional
- [ ] CDN para assets - opcional
- [ ] Lazy loading de imagens
- [ ] Service Worker (PWA)

### Próximos Passos

1. Implementar as fases 1-4 (crítico)
2. Rodar testes (fase 6)
3. Aplicar otimizações (fase 7)
4. Documentar API (fase 8)
5. Preparar deploy (fase 10)

---

**Tempo estimado total: 15-20 horas**
**Prioridade: Fases 1-4 são críticas, 5-6 são importantes, 7-10 são melhorias**
