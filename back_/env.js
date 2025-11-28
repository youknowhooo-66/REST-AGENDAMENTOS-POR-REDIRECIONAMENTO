import dotenv from 'dotenv';
dotenv.config();

export const env = {
  databaseUrl: "postgresql://postgres:142536@localhost:5432/sistema_agendamento2",
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET ?? "FDQ@r3fresH$eCr3t", 
  accessTtl: process.env.JWT_ACCESS_EXPIRES_IN ?? 900000,
  refreshTtl: process.env.JWT_REFRESH_EXPIRES_IN ?? 28800000,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173", // Placeholder for frontend URL

  // Email Configuration for Nodemailer
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM ?? '"Seu Serviço de Agendamento" <no-reply@example.com>',
};
