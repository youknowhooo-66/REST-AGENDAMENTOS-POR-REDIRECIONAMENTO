// back_/src/services/emailService.js

import { env } from '../../env.js'; // Importa as variáveis de ambiente

// Função para enviar e-mail de cancelamento
export async function sendCancelEmail(recipientEmail, slot, booking, cancelUrl) {
    console.log('--- SIMULANDO ENVIO DE E-MAIL DE CANCELAMENTO ---');
    console.log(`Para: ${recipientEmail}`);
    console.log(`Assunto: Confirmação de Agendamento e Link de Cancelamento`);
    console.log(`
        Olá!

        Seu agendamento para o serviço "${slot.service.name}" com o provedor "${slot.provider.name}"
        no dia ${new Date(slot.startAt).toLocaleString()} foi confirmado.

        Para cancelar este agendamento, clique no link abaixo:
        ${cancelUrl}

        Este link é válido por 24 horas.

        Obrigado!
    `);
    console.log('--------------------------------------------------');

    // Em um ambiente real, você usaria um serviço de e-mail como Nodemailer, SendGrid, Mailgun, etc.
    // Exemplo com Nodemailer (requer configuração):
    /*
    const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email", // ou seu SMTP real
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'seu_email@example.com',
            pass: 'sua_senha',
        },
    });

    let info = await transporter.sendMail({
        from: '"Seu Serviço de Agendamento" <no-reply@example.com>',
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
    console.log("Message sent: %s", info.messageId);
    */
}

// Função para enviar e-mail de confirmação (para uso futuro, se necessário)
export async function sendConfirmationEmail(recipientEmail, slot, booking) {
    console.log('--- SIMULANDO ENVIO DE E-MAIL DE CONFIRMAÇÃO ---');
    console.log(`Para: ${recipientEmail}`);
    console.log(`Assunto: Agendamento Confirmado!`);
    console.log(`
        Olá!

        Seu agendamento para o serviço "${slot.service.name}" com o provedor "${slot.provider.name}"
        no dia ${new Date(slot.startAt).toLocaleString()} foi confirmado com sucesso.

        Detalhes do Agendamento:
        Serviço: ${slot.service.name}
        Provedor: ${slot.provider.name}
        Data/Hora: ${new Date(slot.startAt).toLocaleString()}

        Obrigado por usar nosso serviço!
    `);
    console.log('--------------------------------------------------');
}
