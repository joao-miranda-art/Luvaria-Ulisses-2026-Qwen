import crypto from 'crypto';
import { config } from '../config';

/**
 * Webhook Signer — HMAC SHA256
 * Garante que apenas payloads legítimos sejam processados pelo n8n
 * e vice-versa.
 */
export class WebhookSigner {
  /**
   * Assina um payload JSON
   */
  static sign(payload: unknown): string {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', config.webhookSecretN8N)
      .update(body, 'utf-8')
      .digest('hex');
  }

  /**
   * Verifica a assinatura de um payload recebido
   */
  static verify(payload: unknown, signature: string): boolean {
    const expectedSignature = this.sign(payload);
    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8'),
    );
  }

  /**
   * Header que carrega a assinatura
   */
  static get signatureHeader(): string {
    return 'X-Webhook-Signature';
  }
}
