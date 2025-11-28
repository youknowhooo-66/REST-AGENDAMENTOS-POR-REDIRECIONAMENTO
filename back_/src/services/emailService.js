// back_/src/services/emailService.js

import { env } from '../../env.js'; // Importa as variáveis de ambiente
import nodemailer from 'nodemailer'; // Import nodemailer

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: env.emailHost,
    port: parseInt(env.emailPort),
    secure: parseInt(env.emailPort) === 465, // true for 465, false for other ports
    auth: {
        user: env.emailUser,
        pass: env.emailPass,
    },
});

// Function to send cancellation email
export async function sendCancelEmail(recipientEmail, slot, booking, cancelUrl) {
    try {
        let info = await transporter.sendMail({
            from: env.emailFrom,
            to: recipientEmail,
            subject: "Confirmação de Agendamento e Link de Cancelamento",
            html: `
                <p>Olá!</p>
                <p>Seu agendamento para o serviço "<b>${slot.service.name}</b>" com o provedor "<b>${slot.provider.name}</b>"</p>
                <p>no dia <b>${new Date(slot.startAt).toLocaleString()}</b> foi confirmado.</p>
                <p>Para cancelar este agendamento, clique no link abaixo:</p>
                <p><a href="${cancelUrl}">Cancelar Agendamento</a></p>
                <p>Este link é válido por 24 horas.</p>
                <p>Obrigado!</p>
            `,
        });
        console.log("Cancellation Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending cancellation email:", error);
    }
}

// Function to send confirmation email
export async function sendConfirmationEmail(recipientEmail, slot, booking) {
    try {
        let info = await transporter.sendMail({
            from: env.emailFrom,
            to: recipientEmail,
            subject: "Agendamento Confirmado!",
            html: `
                <p>Olá!</p>
                <p>Seu agendamento para o serviço "<b>${slot.service.name}</b>" com o provedor "<b>${slot.provider.name}</b>"</p>
                <p>no dia <b>${new Date(slot.startAt).toLocaleString()}</b> foi confirmado com sucesso.</p>
                <p>Detalhes do Agendamento:</p>
                <ul>
                    <li>Serviço: <b>${slot.service.name}</b></li>
                    <li>Provedor: <b>${slot.provider.name}</b></li>
                    <li>Data/Hora: <b>${new Date(slot.startAt).toLocaleString()}</b></li>
                </ul>
                <p>Obrigado por usar nosso serviço!</p>
            `,
        });
        console.log("Confirmation Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending confirmation email:", error);
    }
}
