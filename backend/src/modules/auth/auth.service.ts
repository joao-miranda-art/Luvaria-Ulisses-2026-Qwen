import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../shared/database/prisma';
import { config } from '../../shared/config';
import { AppError, ValidationError, ConflictError, UnauthorizedError } from '../../core/errors/app-error';
import { logger } from '../../shared/utils/logger';

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'CLIENT';
}

export class AuthService {
  /**
   * Login com email e senha
   * Retorna access token + refresh token
   */
  async login(input: LoginInput) {
    // Busca por email — sem enumeração de usuário (mensagem genérica)
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Gerar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    logger.info(`Login realizado: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh Token — gera novo access token
   */
  async refresh(refreshToken: string) {
    // Buscar token no banco
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token inválido ou expirado');
    }

    if (!storedToken.user.isActive) {
      // Revogar todos os tokens do usuário
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });
      throw new UnauthorizedError('Conta desativada');
    }

    // Revogar token antigo
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Gerar novos tokens
    const newAccessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(storedToken.user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout — revoga refresh token
   */
  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  /**
   * Cria um novo usuário (apenas ADMIN pode chamar)
   */
  async createUser(data: CreateUserData, createdByUserId: string) {
    // Verificar duplicata
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: data.role || 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: createdByUserId,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role }),
      },
    });

    return user;
  }

  /**
   * Cria múltiplos usuários em lote (CSV import)
   */
  async createUsersInBatch(
    users: CreateUserData[],
    createdByUserId: string
  ) {
    const results: Array<{ success: boolean; email: string; error?: string; user?: any }> = [];

    for (const userData of users) {
      try {
        const user = await this.createUser(userData, createdByUserId);
        results.push({ success: true, email: userData.email, user });
      } catch (err: any) {
        results.push({ success: false, email: userData.email, error: err.message });
      }
    }

    return results;
  }

  /**
   * Resetar senha de um usuário (ADMIN only)
   */
  async resetPassword(userId: string, newPassword: string, adminUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Revogar todos os refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: userId,
      },
    });
  }

  /**
   * Ativar/desativar conta
   */
  async toggleUserStatus(userId: string, adminUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });

    // Se desativou, revogar todos os tokens
    if (!updated.isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entity: 'User',
        entityId: userId,
      },
    });

    return updated;
  }

  // ========================
  // Métodos privados
  // ========================

  private generateAccessToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  private async generateRefreshToken(user: { id: string }): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();

    // Parse JWT_REFRESH_EXPIRES_IN (ex: "7d")
    const match = config.jwtRefreshExpiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, value, unit] = match;
      const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      expiresAt.setTime(expiresAt.getTime() + parseInt(value) * (multipliers[unit] || 86400000));
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // Fallback: 7 dias
    }

    await prisma.refreshToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    return token;
  }
}

export const authService = new AuthService();
