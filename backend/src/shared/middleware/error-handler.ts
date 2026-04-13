import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors/app-error';
import { logger } from '../shared/utils/logger';
import { config } from '../shared/config';

export function errorHandler(
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log de erro
  logger.error('Erro não tratado:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    name: error.name,
  });

  // Erro operacional (conhecido)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(config.nodeEnv === 'development' && { stack: error.stack }),
    });
    return;
  }

  // Erro inesperado — não expor detalhes
  res.status(500).json({
    error: 'Erro interno do servidor. Nossa equipe foi notificada.',
  });
}
