import express from 'express'
import cors from "cors";
import { auth } from './middleware/auth.js';
import  {authRouter}  from './routes/authRoutes.js';
import { serviceRouter } from './routes/authService.js';
import { userRouter } from './routes/authUser.js';
import { appointmentRouter } from './routes/authAppointment.js';
import { staffRouter } from './routes/authStaff.js'; // Nova rota para gerenciamento de staff
import { availabilitySlotRouter } from './routes/authAvailabilitySlot.js'; // Importar o novo router de slots
import { bookingRouter } from './routes/authBooking.js'; // Importar o novo router de bookings
import { dashboardRouter } from './routes/authDashboard.js'; // Importar o novo router de dashboard
import { publicRouter } from './routes/publicRoutes.js'; // Importar o novo router público
import { GoogleGenerativeAI } from "@google/generative-ai";



const app = express()
app.use(express.json());
app.use(cors());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Rota de teste
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar resposta." });
  }
});

// Rota de ping para verificar se o servidor está ativo
app.get("/ping", (req, res) => {
  console.log(" GET /ping chegou");
  res.send("pong");
});


// Rotas Públicas
app.use('/api/public', publicRouter);

// Acessível via POST /auth/login, POST /auth/register
app.use('/api/auth', authRouter); 

// Roteadores CRUD (PROTEGIDOS)
// Aplica o middleware 'auth' APENAS para as rotas CRUD
app.use('/api/users', auth, userRouter);         // Acessível via GET /users
app.use('/api/services', auth, serviceRouter);   // Acessível via GET /services
app.use('/api/appointments', auth, appointmentRouter); // Acessível via GET /appointments
app.use('/api/staff', auth, staffRouter); // Nova rota para gerenciamento de staff
app.use('/api/availability-slots', auth, availabilitySlotRouter); // Nova rota para gerenciamento de horários
app.use('/api/bookings', auth, bookingRouter); // Nova rota para gerenciamento de bookings
app.use('/api/dashboard', auth, dashboardRouter); // Nova rota para o dashboard do provedor

export { app };
