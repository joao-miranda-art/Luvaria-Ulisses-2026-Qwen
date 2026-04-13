import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, createUserSchema, resetPasswordSchema } from './auth.validation';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { authRateLimiter } from '../../shared/middleware/rate-limiter';
import { parse } from 'csv-parse/sync';
import { csvUserSchema } from './auth.validation';
import { ValidationError } from '../../core/errors/app-error';

const router = Router();

// ============================================================
// POST /login — Autenticação com rate limiting
// ============================================================
router.post('/login', authRateLimiter, async (req: Request, res: Response, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.login(validated);

    // Refresh token em cookie httpOnly
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      path: '/api/v1/auth/refresh',
    });

    res.json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /refresh — Renovar token
// ============================================================
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }

    const result = await authService.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });

    res.json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /logout — Revogar token
// ============================================================
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /users — Criar usuário (ADMIN only)
// ============================================================
router.post('/users', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const validated = createUserSchema.parse(req.body);
    const user = await authService.createUser(validated, req.user!.id);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /users/batch — Criar usuários em lote via CSV (ADMIN only)
// ============================================================
router.post('/users/batch', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    // Aceitar CSV no body como string
    const csvContent = req.body.csv;
    if (!csvContent) {
      throw new ValidationError('CSV não fornecido');
    }

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validar cada registro
    const users = records.map((r: any) => csvUserSchema.parse(r));
    const results = await authService.createUsersInBatch(users, req.user!.id);

    res.json({
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /users/:id/reset-password — Resetar senha (ADMIN only)
// ============================================================
router.put('/users/:id/reset-password', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(req.params.id, validated.newPassword, req.user!.id);
    res.json({ message: 'Senha resetada com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /users/:id/toggle-status — Ativar/desativar conta (ADMIN only)
// ============================================================
router.patch('/users/:id/toggle-status', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await authService.toggleUserStatus(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
