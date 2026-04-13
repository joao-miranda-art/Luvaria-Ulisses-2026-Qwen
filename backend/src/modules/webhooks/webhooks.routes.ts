import { Router } from 'express';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { webhookDispatcher } from './webhook-dispatcher';
import { z } from 'zod';

const router = Router();

// Todas as rotas de webhooks são ADMIN only
router.use(authMiddleware);
router.use(requireAdmin);

const testWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.unknown()),
});

// ============================================================
// POST /test — Testar disparo de webhook (ADMIN)
// ============================================================
router.post('/test', async (req: AuthRequest, res, next) => {
  try {
    const validated = testWebhookSchema.parse(req.body);

    const result = await webhookDispatcher.dispatch(
      validated.event as any,
      validated.data
    );

    res.json({
      success: result,
      queueStatus: webhookDispatcher.getQueueStatus(),
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /status — Status da fila de webhooks
// ============================================================
router.get('/status', (_req, res) => {
  res.json(webhookDispatcher.getQueueStatus());
});

export { router as webhooksRouter };
