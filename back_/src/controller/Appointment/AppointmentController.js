import {prisma} from '../../config/prismaClient.js';

class AppointmentController {

    // Função auxiliar para checar conflito de horário
    async checkConflict(startTime, endTime) {
        // Encontra qualquer agendamento que comece antes do fim do novo agendamento 
        // E termine depois do início do novo agendamento
        const conflict = await prisma.appointment.findFirst({
            where: {
                // Checa sobreposição de horários
                startTime: { lt: endTime }, // Começa antes do nosso novo fim
                endTime: { gt: startTime },  // Termina depois do nosso novo começo
                // Excluir status de cancelado se for o caso
                status: { not: 'CANCELLED' } 
            },
        });
        return conflict;
    }

    // CREATE
    async create(req, res) {
        const { clientId, serviceId, startTime: startTimeStr, status } = req.body;
        
        // 1. Validação de dados
        if (!clientId || !serviceId || !startTimeStr) {
             return res.status(400).json({ error: 'ID do cliente, ID do serviço e hora de início são obrigatórios.' });
        }
        
        try {
            const startTime = new Date(startTimeStr);
            const service = await prisma.service.findUnique({ where: { id: parseInt(serviceId) } });
            
            if (!service) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            
            // 2. Calcular hora de término (endTime) baseado na duração do serviço
            const durationMs = service.durationMin * 60000; // minutos para milissegundos
            const endTime = new Date(startTime.getTime() + durationMs);

            // 3. Checar conflito (RF012)
            const conflict = await this.checkConflict(startTime, endTime);
            if (conflict) {
                return res.status(409).json({ error: 'Conflito de horário! Já existe um agendamento nesta faixa.' });
            }
            
            // 4. Criação
            const newAppointment = await prisma.appointment.create({
                data: {
                    clientId: parseInt(clientId),
                    serviceId: parseInt(serviceId),
                    startTime,
                    endTime, // Inclui o fim calculado
                    status: status || 'PENDING',
                },
            });
            return res.status(201).json(newAppointment);

        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao criar agendamento.' });
        }
    }

    // READ (Listar todos)
    async getAll(req, res) {
        try {
            const appointments = await prisma.appointment.findMany({
                include: { client: true, service: true }, // Inclui dados de cliente e serviço
                orderBy: { startTime: 'asc' },
            });
            return res.status(200).json(appointments);
        } catch (error) {
            console.error('Erro ao listar agendamentos:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // READ (Buscar por ID)
    async getById(req, res) {
        const { id } = req.params;
        try {
            const appointment = await prisma.appointment.findUnique({
                where: { id: parseInt(id) },
                include: { client: { select: { id: true, name: true, email: true } }, service: true },
            });
            if (!appointment) {
                return res.status(404).json({ error: 'Agendamento não encontrado.' });
            }
            return res.status(200).json(appointment);
        } catch (error) {
            console.error('Erro ao buscar agendamento:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }

    // UPDATE
    async update(req, res) {
        const { id } = req.params;
        const { clientId, serviceId, startTime: startTimeStr, status } = req.body;
        
        try {
            const currentAppointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
            if (!currentAppointment) {
                return res.status(404).json({ error: 'Agendamento não encontrado para atualizar.' });
            }

            const serviceIdToUse = serviceId ? parseInt(serviceId) : currentAppointment.serviceId;
            const startTimeToUse = startTimeStr ? new Date(startTimeStr) : currentAppointment.startTime;
            
            // 1. Recalcular endTime se o serviço ou hora de início mudou
            let endTimeToUse = currentAppointment.endTime;
            if (serviceId || startTimeStr) {
                 const service = await prisma.service.findUnique({ where: { id: serviceIdToUse } });
                 if (!service) { return res.status(404).json({ error: 'Serviço não encontrado.' }); }
                 
                 const durationMs = service.durationMin * 60000;
                 endTimeToUse = new Date(startTimeToUse.getTime() + durationMs);

                 // 2. Checar conflito, excluindo o agendamento atual (id) da checagem
                 const conflict = await prisma.appointment.findFirst({
                    where: {
                        startTime: { lt: endTimeToUse },
                        endTime: { gt: startTimeToUse },
                        id: { not: parseInt(id) }, // Não checa conflito com ele mesmo!
                        status: { not: 'CANCELLED' } 
                    },
                 });

                 if (conflict) {
                     return res.status(409).json({ error: 'Conflito de horário! Já existe outro agendamento nesta faixa.' });
                 }
            }

            // 3. Executar a atualização
            const updatedAppointment = await prisma.appointment.update({
                where: { id: parseInt(id) },
                data: {
                    clientId: clientId ? parseInt(clientId) : undefined,
                    serviceId: serviceId ? serviceIdToUse : undefined,
                    startTime: startTimeToUse,
                    endTime: endTimeToUse,
                    status: status,
                },
            });
            return res.status(200).json(updatedAppointment);

        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao atualizar agendamento.' });
        }
    }

    // DELETE
    async delete(req, res) {
        const { id } = req.params;
        try {
            await prisma.appointment.delete({
                where: { id: parseInt(id) },
            });
            return res.status(204).send();
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Agendamento não encontrado para exclusão.' });
            }
            console.error('Erro ao deletar agendamento:', error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}

export const appointmentController = new AppointmentController();