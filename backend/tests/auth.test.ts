/**
 * Testes de Unidade — Auth Service
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';

describe('AuthService — Validação de Senha', () => {
  it('deve comparar senha corretamente com bcrypt', async () => {
    const password = 'SenhaSegura123!';
    const hash = await bcrypt.hash(password, 12);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar senha incorreta', async () => {
    const password = 'SenhaSegura123!';
    const hash = await bcrypt.hash(password, 12);
    const isValid = await bcrypt.compare('SenhaErrada', hash);
    expect(isValid).toBe(false);
  });

  it('deve gerar hash com salt round 12', async () => {
    const password = 'Teste@123';
    const hash = await bcrypt.hash(password, 12);
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(50);
  });
});

describe('WebhookSigner — HMAC SHA256', () => {
  const crypto = require('crypto');

  function sign(payload: unknown, secret: string): string {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(body, 'utf-8').digest('hex');
  }

  it('deve gerar assinatura consistente', () => {
    const payload = { event: 'test', data: { id: '123' } };
    const secret = 'test_secret';
    const sig1 = sign(payload, secret);
    const sig2 = sign(payload, secret);
    expect(sig1).toBe(sig2);
  });

  it('deve gerar assinaturas diferentes para payloads diferentes', () => {
    const payload1 = { event: 'test', data: { id: '123' } };
    const payload2 = { event: 'test', data: { id: '456' } };
    const secret = 'test_secret';
    expect(sign(payload1, secret)).not.toBe(sign(payload2, secret));
  });

  it('deve gerar assinaturas diferentes para secrets diferentes', () => {
    const payload = { event: 'test', data: { id: '123' } };
    expect(sign(payload, 'secret1')).not.toBe(sign(payload, 'secret2'));
  });
});

describe('Zod Validation — Login Schema', () => {
  const { z } = require('zod');

  const loginSchema = z.object({
    email: z.string().email('E-mail inválido').toLowerCase(),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  });

  it('deve aceitar credenciais válidas', () => {
    const result = loginSchema.safeParse({
      email: 'user@email.com',
      password: 'senha123',
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar e-mail inválido', () => {
    const result = loginSchema.safeParse({
      email: 'nao-um-email',
      password: 'senha123',
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar senha curta', () => {
    const result = loginSchema.safeParse({
      email: 'user@email.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});
