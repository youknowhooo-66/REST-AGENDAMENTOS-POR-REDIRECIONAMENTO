import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from './middleware/auth.js';
import { authRouter } from './routes/authRoutes.js';
import { serviceRouter } from './routes/authService.js';
import { userRouter } from './routes/authUser.js';
import { appointmentRouter } from './routes/authAppointment.js';
import { staffRouter } from './routes/authStaff.js';
import { availabilitySlotRouter } from './routes/authAvailabilitySlot.js';
import { bookingRouter } from './routes/authBooking.js';
import { dashboardRouter } from './routes/authDashboard.js';
import { publicRouter } from './routes/publicRoutes.js';
import { uploadRouter } from './routes/uploadRoutes.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { corsOptions } from './config/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter, publicLimiter } from './middleware/rateLimit.js';
import { prisma } from './config/prismaClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware global
app.use(compression()); // Compressão de respostas
app.use(express.json());
app.use(cors(corsOptions)); // CORS configurado adequadamente

// Servir arquivos estáticos da pasta 'uploads' com caminho absoluto
// __dirname aponta para back_/src/, então precisamos subir um nível e entrar em uploads
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log('📁 Caminho dos uploads:', uploadsPath);

// Configurar express.static com opções para servir imagens corretamente
app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
        // Definir Content-Type correto baseado na extensão do arquivo
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
        };
        if (mimeTypes[ext]) {
            res.setHeader('Content-Type', mimeTypes[ext]);
        }
        // Permitir CORS para imagens
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
    }
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Rota de teste Gemini
app.post('/api/chat', async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (error) {
    next(error); // Usar tratamento de erro centralizado
  }
});

// Health check completo
app.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // Verificar conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database = 'healthy';
  } catch (error) {
    healthcheck.checks.database = 'unhealthy';
    healthcheck.status = 'unhealthy';
  }

  // Verificar uso de memória
  const memoryUsage = process.memoryUsage();
  const memoryThreshold = 500 * 1024 * 1024; // 500MB
  healthcheck.checks.memory = memoryUsage.heapUsed < memoryThreshold ? 'healthy' : 'warning';
  healthcheck.memory = {
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
  };

  const statusCode = healthcheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthcheck);
});

// Ping simples
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas Públicas (sem autenticação, com rate limit)
app.use('/api/public', publicLimiter, publicRouter);

// Rotas de Autenticação (com rate limit estrito)
app.use('/api/auth', authLimiter, authRouter);

// Rotas Protegidas (requerem autenticação, com rate limit geral)
app.use('/api/users', apiLimiter, auth, userRouter);
app.use('/api/services', auth, serviceRouter);
app.use('/api/appointments', auth, appointmentRouter);
app.use('/api/staff', auth, staffRouter);
app.use('/api/availability-slots', auth, availabilitySlotRouter);
app.use('/api/bookings', auth, bookingRouter);
app.use('/api/dashboard', auth, dashboardRouter);
app.use('/api/upload', auth, uploadRouter);

// ⚠️ IMPORTANTE: Middlewares de erro devem vir por último
app.use(notFoundHandler); // 404 - Rota não encontrada
app.use(errorHandler); // Tratamento global de erros

export { app };
