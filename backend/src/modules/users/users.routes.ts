import { Router } from 'express';
import { prisma } from '../../shared/database/prisma';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { AppError } from '../../core/errors/app-error';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// ============================================================
// GET / — Listar usuários (ADMIN pode ver todos, CLIENT vê só o próprio)
// ============================================================
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { search, role, isActive, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);

    const where: any = {};

    // ADMIN vê todos, CLIENT vê só a si mesmo
    if (req.user!.role !== 'ADMIN') {
      where.id = req.user!.id;
    } else {
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      // Busca por nome, email ou telefone
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ];
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /:id — Detalhes de um usuário
// ============================================================
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    // CLIENT só pode ver a si mesmo
    if (req.user!.role !== 'ADMIN' && req.user!.id !== req.params.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        reservations: {
          select: { id: true, date: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        orders: {
          select: { id: true, status: true, totalPrice: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /:id — Atualizar usuário (ADMIN only)
// ============================================================
router.put('/:id', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: req.params.id,
      },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /:id — Deletar usuário (ADMIN only)
// ============================================================
router.delete('/:id', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    // Proteger: não permitir deletar o próprio admin
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: 'Não é possível deletar sua própria conta' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: req.params.id,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /stats — Estatísticas de usuários (ADMIN only)
// ============================================================
router.get('/admin/stats', requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const [total, active, inactive, admins, clients] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
    ]);

    res.json({ total, active, inactive, admins, clients });
  } catch (err) {
    next(err);
  }
});

export { router as usersRouter };
