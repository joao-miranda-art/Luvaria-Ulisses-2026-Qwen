import { Router } from 'express';
import { prisma } from '../../shared/database/prisma';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { z } from 'zod';
import { AppError } from '../../core/errors/app-error';
import { webhookDispatcher } from '../webhooks/webhook-dispatcher';
import { logger } from '../../shared/utils/logger';

const router = Router();

const reservationSchema = z.object({
  date: z.string().datetime('Data inválida'),
  notes: z.string().max(500).optional(),
});

// ============================================================
// GET / — Listar reservas
// ADMIN: todas as reservas
// CLIENT: apenas as suas
// ============================================================
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where: any = {};

    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    }

    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ reservations });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST / — Criar reserva (qualquer usuário autenticado)
// Dispara webhook para n8n
// ============================================================
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const validated = reservationSchema.parse(req.body);

    const reservationDate = new Date(validated.date);
    if (reservationDate < new Date()) {
      throw new AppError('Data de reserva deve ser futura', 400);
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: req.user!.id,
        date: reservationDate,
        notes: validated.notes,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Disparar webhook para n8n
    try {
      await webhookDispatcher.dispatch('reservation.created', {
        reservation: {
          id: reservation.id,
          date: reservation.date.toISOString(),
          status: reservation.status,
          notes: reservation.notes,
        },
        client: {
          id: reservation.user.id,
          name: reservation.user.name,
          email: reservation.user.email,
          phone: reservation.user.phone,
        },
        timestamp: new Date().toISOString(),
      });

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { webhookSent: true },
      });
    } catch (webhookErr) {
      logger.error('Falha ao disparar webhook de reserva:', webhookErr);
      // Não falhar a reserva se o webhook falhar — registrar e continuar
    }

    res.status(201).json({ reservation });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /:id/status — Atualizar status da reserva (ADMIN only)
// ============================================================
router.patch('/:id/status', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      throw new AppError('Status inválido', 400);
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Disparar webhook se status mudou para CONFIRMED
    if (status === 'CONFIRMED') {
      try {
        await webhookDispatcher.dispatch('reservation.confirmed', {
          reservation: {
            id: updated.id,
            date: updated.date.toISOString(),
            status: updated.status,
            notes: updated.notes,
          },
          client: {
            id: updated.user.id,
            name: updated.user.name,
            email: updated.user.email,
            phone: updated.user.phone,
          },
          timestamp: new Date().toISOString(),
        });

        await prisma.reservation.update({
          where: { id: updated.id },
          data: { webhookSent: true },
        });
      } catch (webhookErr) {
        logger.error('Falha ao disparar webhook de confirmação:', webhookErr);
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: `RESERVATION_${status}`,
        entity: 'Reservation',
        entityId: updated.id,
      },
    });

    res.json({ reservation: updated });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /:id — Cancelar reserva
// CLIENT pode cancelar a própria, ADMIN pode cancelar qualquer
// ============================================================
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Verificar permissão
    if (req.user!.role !== 'ADMIN' && reservation.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'RESERVATION_CANCELLED',
        entity: 'Reservation',
        entityId: updated.id,
      },
    });

    res.json({ reservation: updated });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /admin/stats — Estatísticas de reservas (ADMIN)
// ============================================================
router.get('/admin/stats', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const [total, pending, confirmed, cancelled, completed, upcoming] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.reservation.count({ where: { status: 'CANCELLED' } }),
      prisma.reservation.count({ where: { status: 'COMPLETED' } }),
      prisma.reservation.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] }, date: { gte: new Date() } } }),
    ]);

    res.json({ total, pending, confirmed, cancelled, completed, upcoming });
  } catch (err) {
    next(err);
  }
});

export { router as reservationsRouter };
