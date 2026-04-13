import Redis from 'ioredis';
import { config } from '../config';

let client: Redis;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // Desistir após 3 tentativas
        return Math.min(times * 200, 2000);
      },
    });

    client.on('error', (err) => {
      // Silenciar erros de conexão em desenvolvimento quando Redis não está disponível
      if (config.nodeEnv === 'production') {
        console.error('Redis error:', err.message);
      }
    });
  }
  return client;
}

// Exportar como singleton
export const redis = getRedisClient();
