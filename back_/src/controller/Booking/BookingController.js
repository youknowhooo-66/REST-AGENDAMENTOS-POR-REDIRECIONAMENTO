import { prisma } from '../../config/prismaClient.js'; // Corrected import path
import { v4 as uuidv4 } from "uuid";
import { sendCancelEmail } from "../../services/emailService.js"; // Uncommented and corrected import
import pkg from '@prisma/client';
const { BookingStatus, SlotStatus, Role } = pkg;

export const createBooking = async (req, res) => { // Removed type annotations
  const { userId, role } = req.user; // Use req.user.userId as set by auth middleware
  const { slotId } = req.body;

  if (role !== Role.CLIENT) {
    return res.status(403).json({ error: 'Apenas clientes podem realizar esta ação.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) pego o slot FOR UPDATE (via SELECT) — Prisma não tem FOR UPDATE direto; mas checagem + unique protege
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { provider: true, service: true }
      });

      if (!slot) throw { status: 404, message: "Slot não encontrado" };
      if (slot.status !== "OPEN") throw { status: 409, message: "Slot indisponível" };

      // 2) crio booking
      const cancelToken = uuidv4();
      const tokenExp = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

      const booking = await tx.booking.create({
        data: {
          userId,
          slotId,
          cancelToken,
          cancelTokenExp: tokenExp
        }
      });

      // 3) atualizo slot para BOOKED e linko bookingId
      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: {
          status: "BOOKED",
          bookingId: booking.id
        }
      }
      );

      return { booking, slot };
    });

    // 4) enviar e-mail com link de cancelamento (fora da transaction)
    const cancelUrl = `${process.env.FRONTEND_URL}/cancel?token=${result.booking.cancelToken}`;
    await sendCancelEmail(req.user.email, result.slot, result.booking, cancelUrl);

    return res.status(201).json({ bookingId: result.booking.id });
  } catch (err) { // Removed type annotation
    // Unique constraint / race condition handling
    if (err.code === "P2002" || (err.status === 409)) {
      return res.status(409).json({ message: "Slot já reservado por outro usuário" });
    }
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || "Erro ao criar booking" });
  }
};

export const cancelBooking = async (req, res) => {
  const { token } = req.query; // Token de cancelamento vem da URL

  if (!token) {
    return res.status(400).json({ error: 'Token de cancelamento é obrigatório.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { cancelToken: token },
        include: { slot: true },
      });

      if (!booking) {
        throw { status: 404, message: 'Agendamento não encontrado ou token inválido.' };
      }

      if (booking.cancelTokenExp && new Date() > booking.cancelTokenExp) {
        throw { status: 400, message: 'Token de cancelamento expirado.' };
      }

      if (booking.status === BookingStatus.CANCELLED) {
        return { message: 'Agendamento já foi cancelado.', booking };
      }

      // Atualiza o status do agendamento para CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      });

      // Atualiza o status do slot para OPEN
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: SlotStatus.OPEN, bookingId: null },
      });

      return { message: 'Agendamento cancelado com sucesso.', booking };
    });

    return res.status(200).json({ message: result.message, bookingId: result.booking.id });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro ao cancelar agendamento.' });
  }
};

export const getClientBookings = async (req, res) => {
  const { userId, role } = req.user;

  if (role !== Role.CLIENT) {
    return res.status(403).json({ error: 'Apenas clientes podem realizar esta ação.' });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: {
        slot: {
          include: {
            service: true,
            provider: true,
            staff: true,
          },
        },
      },
      orderBy: {
        slot: {
          startAt: 'desc',
        },
      },
    });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Erro ao buscar agendamentos do cliente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const getProviderBookings = async (req, res) => {
  const { userId, role } = req.user;
  const { date, serviceId, staffId } = req.query; // Extract filter parameters

  if (role !== Role.PROVIDER) {
    return res.status(403).json({ error: 'Apenas provedores podem realizar esta ação.' });
  }

  try {
    const provider = await prisma.provider.findFirst({
      where: { ownerId: userId },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provedor não encontrado para o usuário autenticado.' });
    }

    let whereClause = {
      slot: {
        providerId: provider.id,
      },
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.slot.startAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (serviceId) {
      whereClause.slot.serviceId = serviceId;
    }

    if (staffId) {
      whereClause.slot.staffId = staffId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        slot: {
          include: {
            service: true,
            staff: true,
          },
        },
      },
      orderBy: {
        slot: {
          startAt: 'desc',
        },
      },
    });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Erro ao buscar agendamentos do provedor:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const providerCancelBooking = async (req, res) => {
  const { bookingId } = req.params; // Booking ID from URL parameters
  const { userId, role } = req.user;

  if (role !== Role.PROVIDER) {
    return res.status(403).json({ error: 'Apenas provedores podem cancelar agendamentos.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find the provider
      const provider = await tx.provider.findFirst({
        where: { ownerId: userId },
      });

      if (!provider) {
        throw { status: 404, message: 'Provedor não encontrado para o usuário autenticado.' };
      }

      // Find the booking and ensure it belongs to this provider
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          slot: {
            select: {
              providerId: true,
            },
          },
        },
      });

      if (!booking) {
        throw { status: 404, message: 'Agendamento não encontrado.' };
      }

      if (booking.slot.providerId !== provider.id) {
        throw { status: 403, message: 'Você não tem permissão para cancelar este agendamento.' };
      }

      if (booking.status === BookingStatus.CANCELLED) {
        return { message: 'Agendamento já foi cancelado.', booking };
      }

      // Update booking status to CANCELLED
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // Update slot status to OPEN and unlink bookingId
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: SlotStatus.OPEN, bookingId: null },
      });

      return { message: 'Agendamento cancelado com sucesso pelo provedor.', booking };
    });

    return res.status(200).json({ message: result.message, bookingId: result.booking.id });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro ao cancelar agendamento pelo provedor.' });
  }
};
