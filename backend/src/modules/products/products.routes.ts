import { Router } from 'express';
import { prisma } from '../../shared/database/prisma';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { z } from 'zod';
import { AppError } from '../../core/errors/app-error';

const router = Router();

// Zod schemas
const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive('Preço deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
});

// ============================================================
// GET / — Listar produtos (público para catálogo)
// ============================================================
router.get('/', async (_req, res, next) => {
  try {
    const { category, isActive = 'true', search } = _req.query;
    const where: any = {};

    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        materials: {
          include: { material: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /:id — Detalhes do produto (público)
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id, isActive: true },
      include: {
        materials: {
          include: { material: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST / — Criar produto (ADMIN only)
// ============================================================
router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const validated = productSchema.parse(req.body);

    // Gerar slug
    const slug = validated.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        ...validated,
        slug,
        basePrice: validated.basePrice,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product.id,
        details: JSON.stringify({ name: product.name }),
      },
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /:id — Atualizar produto (ADMIN only)
// ============================================================
router.put('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const validated = productSchema.partial().parse(req.body);

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    let slug = existing.slug;
    if (validated.name) {
      slug = validated.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { ...validated, slug },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: product.id,
      },
    });

    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /:id — Deletar produto (ADMIN only)
// ============================================================
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: req.params.id,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as productsRouter };
