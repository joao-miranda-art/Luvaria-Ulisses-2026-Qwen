import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './shared/config';
import { errorHandler } from './shared/middleware/error-handler';
import { rateLimiter } from './shared/middleware/rate-limiter';
import { healthRouter } from './shared/middleware/health-routes';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { productsRouter } from './modules/products/products.routes';
import { materialsRouter } from './modules/materials/materials.routes';
import { reservationsRouter } from './modules/reservations/reservations.routes';
import { uploadsRouter } from './modules/uploads/uploads.routes';
import { webhooksRouter } from './modules/webhooks/webhooks.routes';
import { logger } from './shared/utils/logger';

const app = express();

// ============================================================
// SECURITY — Middlewares de segurança
// ============================================================
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ============================================================
// RATE LIMITING — Proteção contra brute force
// ============================================================
app.use('/api', rateLimiter);

// ============================================================
// HEALTH CHECK — Sem autenticação
// ============================================================
app.use('/health', healthRouter);

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/materials', materialsRouter);
app.use('/api/v1/reservations', reservationsRouter);
app.use('/api/v1/uploads', uploadsRouter);
app.use('/api/v1/webhooks', webhooksRouter);

// ============================================================
// 404 — Rota não encontrada
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ============================================================
// ERROR HANDLER — Global
// ============================================================
app.use(errorHandler);

export default app;
