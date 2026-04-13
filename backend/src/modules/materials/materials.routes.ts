import { Router } from 'express';
import { prisma } from '../../shared/database/prisma';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { z } from 'zod';

const router = Router();

const materialSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['LEATHER', 'LINING', 'TRIM']),
  description: z.string().optional(),
  priceExtra: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// ============================================================
// GET / — Listar materiais
// ============================================================
router.get('/', async (_req, res, next) => {
  try {
    const { type, isActive } = _req.query;
    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const materials = await prisma.material.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ materials });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST / — Criar material (ADMIN)
// ============================================================
router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const validated = materialSchema.parse(req.body);

    const material = await prisma.material.create({
      data: validated,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'MATERIAL_CREATED',
        entity: 'Material',
        entityId: material.id,
      },
    });

    res.status(201).json({ material });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /:id — Atualizar material (ADMIN)
// ============================================================
router.put('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const validated = materialSchema.partial().parse(req.body);

    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: validated,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'MATERIAL_UPDATED',
        entity: 'Material',
        entityId: material.id,
      },
    });

    res.json({ material });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /:id/stock — Atualizar estoque
// ============================================================
router.patch('/:id/stock', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { stock } = req.body;
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Estoque inválido' });
    }

    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: { stock },
    });

    res.json({ material });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /:id — Deletar material (ADMIN)
// ============================================================
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'MATERIAL_DELETED',
        entity: 'Material',
        entityId: req.params.id,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as materialsRouter };
