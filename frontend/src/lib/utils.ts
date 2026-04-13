import { type ClassValue, clsx } from 'clsx';

/**
 * Utilitário para combinar classes condicionalmente
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formatar preço em BRL
 */
export function formatBRL(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

/**
 * Formatar data para exibição
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Gerar slug de string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Status label para exibição
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Concluído',
    DRAFT: 'Rascunho',
    IN_PRODUCTION: 'Em Produção',
    READY: 'Pronto',
    DELIVERED: 'Entregue',
  };
  return labels[status] || status;
}

/**
 * Badge classe para status
 */
export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    CANCELLED: 'badge-cancelled',
    COMPLETED: 'badge-completed',
    DRAFT: 'badge-pending',
    IN_PRODUCTION: 'badge-pending',
    READY: 'badge-confirmed',
    DELIVERED: 'badge-completed',
  };
  return classes[status] || 'badge-pending';
}
