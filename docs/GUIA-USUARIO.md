# Guia de Uso — Luvaria Ulisses 2026

> Para o gerente e equipe da Luvaria Ulisses — sem termos técnicos, direto ao ponto.

---

## Índice

1. [Como Entrar no Sistema](#1-como-entrar-no-sistema)
2. [Painel Principal](#2-painel-principal)
3. [Cadastrar um Novo Cliente](#3-cadastrar-um-novo-cliente)
4. [Importar Vários Clientes de Uma Vez (CSV)](#4-importar-vários-clientes-de-uma-vez-csv)
5. [Resetar Senha de um Cliente](#5-resetar-senha-de-um-cliente)
6. [Ativar/Desativar Conta de um Cliente](#6-ativardesativar-conta-de-um-cliente)
7. [Cadastrar um Novo Produto](#7-cadastrar-um-novo-produto)
8. [Ver e Gerenciar Reservas VIP](#8-ver-e-gerenciar-reservas-vip)
9. [Confirmar uma Reserva](#9-confirmar-uma-reserva)
10. [Cancelar uma Reserva](#10-cancelar-uma-reserva)
11. [O Que Acontece Automaticamente](#11-o-que-acontece-automaticamente)
12. [Problemas Comuns e Soluções](#12-problemas-comuns-e-soluções)

---

## 1. Como Entrar no Sistema

1. Acesse o endereço do site (ex: `luvariaulisses.com.br`)
2. Clique em **"Entrar"** no canto superior direito
3. Digite seu **e-mail** e **senha**
4. Clique em **"Entrar"**

> ⚠️ Se esquecer a senha, peça ao administrador para resetar.

---

## 2. Painel Principal

Ao entrar como **administrador**, você verá:

| Seção | O que mostra |
|-------|-------------|
| **Status do Sistema** | Se o servidor, banco de dados e WhatsApp estão funcionando |
| **Ações Rápidas** | Botões para ir direto para Produtos, Clientes, Reservas ou Materiais |
| **Números** | Total de clientes, reservas agendadas, produtos |
| **Reservas Recentes** | Últimas reservas feitas pelos clientes |

---

## 3. Cadastrar um Novo Cliente

1. Clique em **"Clientes"** no menu lateral
2. Clique em **"+ Novo Cliente"**
3. Preencha:
   - **Nome** do cliente
   - **E-mail**
   - **Telefone** (com DDD)
   - **Senha temporária** (o cliente pode trocar depois)
4. Clique em **"Criar"**

> 📱 Automaticamente o cliente receberá as credenciais por WhatsApp.

---

## 4. Importar Vários Clientes de Uma Vez (CSV)

Ideal para quando você tem uma lista de clientes em uma planilha.

1. Clique em **"Clientes"** no menu lateral
2. Clique em **"📥 Importar CSV"**
3. Cole os dados no formato:

```
email,name,phone,role
joao@email.com,João Silva,5511999999999,CLIENT
maria@email.com,Maria Santos,5511988887777,CLIENT
```

4. Clique em **"Importar"**

> ✅ Cada cliente importado receberá automaticamente:
> - Credenciais por WhatsApp
> - Guia de Boas-Vindas em PDF

---

## 5. Resetar Senha de um Cliente

1. Vá em **"Clientes"**
2. Encontre o cliente na lista
3. Clique no ícone **🔑** ao lado do nome
4. Digite a nova senha
5. Confirme

> O cliente poderá trocar a senha no próximo acesso.

---

## 6. Ativar/Desativar Conta de um Cliente

1. Vá em **"Clientes"**
2. Encontre o cliente na lista
3. Clique em **⏸️** para desativar ou **▶️** para ativar

> ⚠️ Ao desativar, o cliente **perde imediatamente o acesso**. Nenhum token antigo funcionará.

---

## 7. Cadastrar um Novo Produto

1. Clique em **"Produtos"** no menu lateral
2. Clique em **"+ Novo Produto"**
3. Preencha:
   - **Nome** (ex: "Luva Clássica de Cabrito")
   - **Descrição** (opcional, mas recomendado)
   - **Preço Base** (ex: 890.00)
   - **Categoria** (ex: "Clássica", "Cerimônia")
4. Clique em **"Criar"**

> 📸 Para adicionar fotos, clique em **"Editar"** no produto e faça o upload.

---

## 8. Ver e Gerenciar Reservas VIP

1. Clique em **"Reservas VIP"** no menu lateral
2. Use os filtros para ver por status:
   - **Todos** — Todas as reservas
   - **Pendente** — Aguardando confirmação
   - **Confirmado** — Já confirmado pelo admin
   - **Cancelado** — Canceladas
   - **Concluído** — Atendimento já realizado

---

## 9. Confirmar uma Reserva

1. Encontre a reserva na lista (status "Pendente")
2. Clique em **"✅ Confirmar"**

> 📱 Automaticamente o cliente receberá:
> - Confirmação por WhatsApp
> - Lembrete 24h antes do agendamento

---

## 10. Cancelar uma Reserva

1. Encontre a reserva na lista
2. Clique em **"✕ Cancelar"**

> O cliente será notificado sobre o cancelamento.

---

## 11. O Que Acontece Automaticamente

| Ação | O sistema faz automaticamente |
|------|------------------------------|
| **Cliente agenda Reserva VIP** | Envia WhatsApp para cliente e loja |
| **Admin confirma reserva** | Envia confirmação + lembrete 24h antes |
| **Admin importa clientes via CSV** | Envia credenciais + Guia de Boas-Vindas |
| **Admin marca pedido como "Entregue"** | Envia instruções de cuidado + agenda follow-up |

> 🔗 Tudo isso é feito pelo sistema de automação (n8n). Você não precisa fazer nada manualmente.

---

## 12. Problemas Comuns e Soluções

| Problema | Solução |
|----------|---------|
| **"E-mail ou senha inválidos"** | Verifique o e-mail. Se esqueceu a senha, peça ao admin |
| **Cliente não recebeu WhatsApp** | Verifique se o telefone está correto. Contate o suporte técnico |
| **Reserva não aparece** | Verifique o filtro de status (Pendente, Confirmado, etc.) |
| **Produto sem foto** | Clique em Editar → Upload de imagem |
| **Sistema fora do ar** | Verifique o "Status do Sistema" no painel. Se vermelho, contate o suporte |
| **Status do n8n com ⚠️** | A automação pode estar temporariamente indisponível. As ações serão processadas quando voltar |

---

## Dicas Importantes

✅ **Sempre confirme reservas o mais rápido possível** — o cliente fica aguardando.
✅ **Mantenha os dados dos clientes atualizados** — telefone correto = WhatsApp funcionando.
✅ **Use categorias nos produtos** — ajuda o cliente a navegar.
✅ **Desative contas de clientes inadimplentes** — em vez de deletar, assim o histórico é preservado.

---

**Precisa de ajuda?** Entre em contato com o suporte técnico pelo WhatsApp do Gabriel (administração do sistema).
