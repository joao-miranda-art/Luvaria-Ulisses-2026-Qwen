# Webhook Map — Luvaria Ulisses 2026

> Documento técnico descrevendo todos os eventos que o sistema dispara para o n8n via webhooks.

---

## Segurança: Assinatura HMAC SHA256

Todos os payloads são assinados com HMAC SHA256 usando a chave `WEBHOOK_SECRET_N8N`.

### Headers enviados

| Header | Descrição |
|--------|-----------|
| `Content-Type` | `application/json` |
| `X-Webhook-Signature` | Assinatura HMAC SHA256 do payload |
| `X-Webhook-Event` | Nome do evento (ex: `reservation.created`) |
| `X-Request-ID` | UUID único para idempotência |

### Verificação no n8n

```javascript
// No nó "Code" ou "Function" do n8n:
const crypto = require('crypto');
const webhookSecret = 'sua_chave_webhook_secret'; // Guardar em variável de ambiente
const signature = $request.headers['x-webhook-signature'];
const payload = JSON.stringify($request.body);

const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Assinatura inválida! Payload adulterado.');
}
```

---

## Formato Geral do Payload

```json
{
  "event": "nome.do.evento",
  "data": {
    "dados_especificos": "..."
  },
  "timestamp": "2026-04-12T14:00:00.000Z",
  "source": "luvaria-ulisses-api",
  "version": "1.0"
}
```

---

## Eventos

### 1. `user.created_batch` — Lote de Usuários Criados (CSV Import)

**Quando**: ADMIN importa CSV de clientes em lote.

**Webhook**: `/api/v1/auth/users/batch` → trigger → n8n

**Payload**:

```json
{
  "event": "user.created_batch",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "cliente@email.com",
        "name": "João Silva",
        "phone": "+5511999999999",
        "role": "CLIENT",
        "temporaryPassword": true
      }
    ],
    "totalCreated": 15,
    "totalFailed": 2,
    "adminId": "uuid-admin"
  },
  "timestamp": "2026-04-12T10:30:00.000Z",
  "source": "luvaria-ulisses-api",
  "version": "1.0"
}
```

**Automação n8n sugerida**:
1. Para cada usuário criado com sucesso:
   - Enviar WhatsApp com credenciais e Guia de Boas-Vindas em PDF
   - Enviar e-mail de boas-vindas
2. Notificar ADMIN sobre falhas

---

### 2. `reservation.created` — Nova Reserva VIP Agendada

**Quando**: CLIENT agenda uma Reserva VIP.

**Payload**:

```json
{
  "event": "reservation.created",
  "data": {
    "reservation": {
      "id": "res_uuid",
      "date": "2026-04-19T14:00:00.000Z",
      "status": "PENDING",
      "notes": "Gostaria de experimentar luvas de couro de veado."
    },
    "client": {
      "id": "user_uuid",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "+5511988887777"
    }
  },
  "timestamp": "2026-04-12T10:30:00.000Z",
  "source": "luvaria-ulisses-api",
  "version": "1.0"
}
```

**Automação n8n sugerida**:
1. Enviar WhatsApp ao CLIENT: "Sua Reserva VIP foi recebida! Aguarde confirmação."
2. Notificar ADMIN no WhatsApp: "Nova Reserva VIP: Maria Silva — 19/04 às 14h"

---

### 3. `reservation.confirmed` — Reserva VIP Confirmada

**Quando**: ADMIN confirma uma reserva no painel.

**Payload**:

```json
{
  "event": "reservation.confirmed",
  "data": {
    "reservation": {
      "id": "res_uuid",
      "date": "2026-04-19T14:00:00.000Z",
      "status": "CONFIRMED",
      "notes": "Gostaria de experimentar luvas de couro de veado."
    },
    "client": {
      "id": "user_uuid",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "+5511988887777"
    }
  },
  "timestamp": "2026-04-12T15:00:00.000Z",
  "source": "luvaria-ulisses-api",
  "version": "1.0"
}
```

**Automação n8n sugerida**:
1. Enviar WhatsApp ao CLIENT: "Reserva confirmada! Dia 19/04 às 14h. Endereço: ..."
2. Adicionar lembrete para 24h antes no WhatsApp

---

### 4. `order.completed` — Pedido Entregue (Pós-venda)

**Quando**: ADMIN marca um pedido como "DELIVERED" (Entregue).

**Payload**:

```json
{
  "event": "order.completed",
  "data": {
    "order": {
      "id": "order_uuid",
      "status": "DELIVERED",
      "totalPrice": 1290.00,
      "items": [
        {
          "productName": "Luva de Cerimônia",
          "size": "7",
          "quantity": 1,
          "unitPrice": 1290.00
        }
      ]
    },
    "client": {
      "id": "user_uuid",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "+5511988887777"
    },
    "deliveredAt": "2026-05-10T16:00:00.000Z"
  },
  "timestamp": "2026-05-10T16:00:00.000Z",
  "source": "luvaria-ulisses-api",
  "version": "1.0"
}
```

**Automação n8n sugerida**:
1. Enviar WhatsApp com instruções de cuidado com o couro (PDF/imagem)
2. Agendar mensagem de follow-up para 7 dias: "Como estão suas luvas?"
3. Agendar mensagem de follow-up para 30 dias: "Precisa de outra par?"
4. Adicionar cliente à lista de newsletter (se opt-in)

---

## API de Consulta (Read-Only) para n8n

Para gerar relatórios, o n8n pode consultar:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/reservations?startDate=X&endDate=Y` | Reservas no período |
| `GET` | `/api/v1/users?role=CLIENT` | Lista de clientes |
| `GET` | `/api/v1/reservations/admin/stats` | Estatísticas de reservas |
| `GET` | `/api/v1/users/admin/stats` | Estatísticas de usuários |

Todas as chamadas requerem autenticação com token ADMIN via `Authorization: Bearer <token>`.

---

## Endpoints de Origem

Todos os webhooks são disparados para a URL configurada em `N8N_WEBHOOK_URL`.

### Retry Policy

- **3 tentativas** com backoff exponencial (2s, 4s, 8s)
- Timeout de **10 segundos** por tentativa
- Falhas persistentes registradas em log

### Idempotência

Cada reserva/pedido tem o campo `webhookSent` para evitar disparos duplicados.

---

## Testando Webhooks

Pelo painel admin ou via API:

```bash
# Testar webhook
curl -X POST http://localhost:3001/api/v1/webhooks/test \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "reservation.created",
    "data": {
      "reservation": { "id": "test", "date": "2026-04-19T14:00:00Z" },
      "client": { "name": "Test User", "email": "test@test.com" }
    }
  }'
```

Verificar status da fila:

```bash
curl http://localhost:3001/api/v1/webhooks/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
