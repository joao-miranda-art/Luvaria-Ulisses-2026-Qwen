import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change_me_jwt_secret_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_jwt_refresh_secret_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // AWS S3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET || 'luvaria-ulisses',

  // Webhooks
  webhookSecretN8N: process.env.WEBHOOK_SECRET_N8N || 'change_me_webhook_secret',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;

export type Config = typeof config;
