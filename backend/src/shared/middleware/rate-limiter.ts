import rateLimit from 'express-rate-limit';
import { config } from '../shared/config';
import { RateLimitError } from '../core/errors/app-error';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutos
  max: config.rateLimitMaxRequests, // 100 reqs por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: new RateLimitError().message,
  skip: (_req, _res) => config.nodeEnv === 'test', // Sem rate limit em testes
});

// Rate limiting específico para login (brute force protection)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas de login. Aguarde 15 minutos.',
});
