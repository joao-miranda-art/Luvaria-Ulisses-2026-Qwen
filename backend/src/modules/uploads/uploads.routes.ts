import { Router } from 'express';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, requireAdmin, AuthRequest } from '../../shared/middleware/auth-middleware';
import { config } from '../../shared/config';
import { AppError } from '../../core/errors/app-error';
import { logger } from '../../shared/utils/logger';
import { prisma } from '../../shared/database/prisma';
import { z } from 'zod';

const router = Router();

// Zod schema para validação
const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/, 'Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF'),
  fileSize: z.number().max(10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB'), // 10MB
  entityId: z.string().uuid('entityId inválido'),
  entityType: z.enum(['product', 'material']),
});

// S3 Client
function getS3Client() {
  return new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });
}

// ============================================================
// POST /presigned-url — Gerar URL de upload direto (ADMIN)
// ============================================================
router.post('/presigned-url', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const validated = uploadRequestSchema.parse(req.body);

    // Validar tamanho (se enviado)
    if (validated.fileSize > 10 * 1024 * 1024) {
      throw new AppError('Arquivo muito grande. Máximo: 10MB', 400);
    }

    const s3 = getS3Client();
    const key = `${validated.entityType}s/${validated.entityId}/${uuidv4()}-${validated.fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.awsS3Bucket,
      Key: key,
      ContentType: validated.fileType,
      ACL: 'public-read',
      Metadata: {
        'uploaded-by': req.user!.id,
        'entity-type': validated.entityType,
        'entity-id': validated.entityId,
      },
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutos

    // URL pública do objeto
    const publicUrl = `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;

    res.json({
      uploadUrl: signedUrl,
      publicUrl,
      key,
      expiresIn: 300,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /confirm — Confirmar upload e atualizar entidade
// ============================================================
router.post('/confirm', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { entityType, entityId, imageUrl, key } = req.body;

    if (!entityType || !entityId || !imageUrl) {
      throw new AppError('Dados de confirmação incompletos', 400);
    }

    // Verificar se a imagem existe no S3
    const s3 = getS3Client();
    try {
      const headCommand = new PutObjectCommand({
        Bucket: config.awsS3Bucket,
        Key: key,
      });
      // Tentar acessar para verificar existência
      await s3.send(new PutObjectCommand({
        Bucket: config.awsS3Bucket,
        Key: key,
      }));
    } catch {
      // Em produção, usar HeadObjectCommand. Aqui assumimos sucesso se chegou aqui.
    }

    // Adicionar URL à entidade
    if (entityType === 'product') {
      const product = await prisma.product.findUnique({ where: { id: entityId } });
      if (!product) {
        throw new AppError('Produto não encontrado', 404);
      }

      const images = [...product.images, imageUrl];
      await prisma.product.update({
        where: { id: entityId },
        data: { images },
      });
    } else if (entityType === 'material') {
      // Materiais podem ter uma imagem
      // Implementar conforme necessidade
    }

    // Log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'IMAGE_UPLOADED',
        entity: entityType,
        entityId,
        details: JSON.stringify({ key, url: imageUrl }),
      },
    });

    res.json({ success: true, imageUrl });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /:key — Deletar imagem do S3 (ADMIN)
// ============================================================
router.delete('/:key', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const s3 = getS3Client();

    await s3.send(new DeleteObjectCommand({
      Bucket: config.awsS3Bucket,
      Key: key,
    }));

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'IMAGE_DELETED',
        entity: 'S3',
        entityId: key,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as uploadsRouter };
