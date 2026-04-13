import app from './app';
import { config } from './shared/config';
import { prisma } from './shared/database/prisma';
import { logger } from './shared/utils/logger';
import { redis } from './shared/utils/redis';

async function bootstrap() {
  try {
    // Verificar conexão com banco de dados
    await prisma.$connect();
    logger.info('✅ PostgreSQL conectado com sucesso');

    // Verificar conexão com Redis
    try {
      await redis.ping();
      logger.info('✅ Redis conectado com sucesso');
    } catch (err) {
      logger.warn('⚠️ Redis indisponível — rate limiting desabilitado');
    }

    // Iniciar servidor
    app.listen(config.port, () => {
      logger.info(`🚀 Luvaria Ulisses API rodando na porta ${config.port}`);
      logger.info(`📊 Health Check: http://localhost:${config.port}/health`);
      logger.info(`🏥 Deep Health: http://localhost:${config.port}/health/deep`);
    });
  } catch (error) {
    logger.error('❌ Falha ao iniciar aplicação', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido — encerrando...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recebido — encerrando...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

bootstrap();
