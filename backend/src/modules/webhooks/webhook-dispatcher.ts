import { config } from '../../shared/config';
import { WebhookSigner } from '../../shared/utils/webhook-signer';
import { logger } from '../../shared/utils/logger';

/**
 * Tipos de eventos que podem ser disparados para o n8n
 */
export type WebhookEvent =
  | 'user.created'
  | 'user.created_batch'
  | 'reservation.created'
  | 'reservation.confirmed'
  | 'order.completed'
  | 'order.status_changed';

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
  source: 'luvaria-ulisses-api';
  version: '1.0';
}

/**
 * Webhook Dispatcher — Envia eventos assinados para o n8n
 * Garante idempotência e rastreabilidade
 */
class WebhookDispatcher {
  private webhookUrl: string;
  private queue: WebhookPayload[] = [];
  private isProcessing = false;

  constructor() {
    this.webhookUrl = config.n8nWebhookUrl;
  }

  /**
   * Disparar evento (assíncrono com fila)
   */
  async dispatch(event: WebhookEvent, data: Record<string, unknown>): Promise<boolean> {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      source: 'luvaria-ulisses-api',
      version: '1.0',
    };

    // Se não há URL configurada, apenas log
    if (!this.webhookUrl) {
      logger.warn(`Webhook não configurado. Evento: ${event}`);
      return false;
    }

    this.queue.push(payload);

    // Processar fila
    if (!this.isProcessing) {
      return this.processQueue();
    }

    return true;
  }

  /**
   * Processar fila de webhooks
   */
  private async processQueue(): Promise<boolean> {
    if (this.isProcessing || this.queue.length === 0) {
      return false;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const payload = this.queue.shift()!;

      try {
        await this.sendWithRetry(payload, 3);
        logger.info(`✅ Webhook enviado: ${payload.event}`);
      } catch (err) {
        logger.error(`❌ Falha ao enviar webhook ${payload.event}:`, err);
        // Colocar de volta na fila para retry posterior
        this.queue.unshift(payload);
        break;
      }
    }

    this.isProcessing = false;
    return true;
  }

  /**
   * Enviar com retry exponencial
   */
  private async sendWithRetry(payload: WebhookPayload, maxRetries: number): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.send(payload);
        return; // Sucesso
      } catch (err) {
        if (attempt === maxRetries) throw err;
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        logger.warn(`Retry ${attempt}/${maxRetries} para ${payload.event} em ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Enviar um único payload
   */
  private async send(payload: WebhookPayload): Promise<void> {
    const signature = WebhookSigner.sign(payload);

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [WebhookSigner.signatureHeader]: signature,
        'X-Webhook-Event': payload.event,
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Status da fila
   */
  getQueueStatus() {
    return {
      pending: this.queue.length,
      isProcessing: this.isProcessing,
      webhookUrl: this.webhookUrl || 'not_configured',
    };
  }
}

export const webhookDispatcher = new WebhookDispatcher();
