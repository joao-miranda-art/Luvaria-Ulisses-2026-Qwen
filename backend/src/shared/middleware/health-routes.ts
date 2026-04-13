import { Router } from 'express';
import { prisma } from '../database/prisma';
import { redis } from '../utils/redis';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { config } from '../config';

const router = Router();

// /health — Verificação básica (sem dependências externas)
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'luvaria-ulisses-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// /health/deep — Verificação completa de todas as dependências
router.get('/deep', async (_req, res) => {
  const checks: Record<string, { status: string; details?: string }> = {};

  // Verificar PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = { status: 'ok' };
  } catch (err: any) {
    checks.postgres = { status: 'error', details: err.message };
  }

  // Verificar Redis
  try {
    await redis.ping();
    checks.redis = { status: 'ok' };
  } catch (err: any) {
    checks.redis = { status: 'error', details: err.message };
  }

  // Verificar S3
  try {
    const s3 = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });
    await s3.send(new HeadBucketCommand({ Bucket: config.awsS3Bucket }));
    checks.s3 = { status: 'ok' };
  } catch (err: any) {
    checks.s3 = { status: config.nodeEnv === 'production' ? 'error' : 'skipped (dev)', details: err.message };
  }

  // Verificar n8n
  try {
    if (config.n8nWebhookUrl) {
      const response = await fetch(config.n8nWebhookUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
      checks.n8n = { status: response.ok ? 'ok' : 'warning', details: `HTTP ${response.status}` };
    } else {
      checks.n8n = { status: 'not_configured' };
    }
  } catch (err: any) {
    checks.n8n = { status: 'error', details: err.message };
  }

  // Status geral
  const allHealthy = Object.values(checks).every(c => c.status === 'ok' || c.status === 'not_configured');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

export { router as healthRouter };
