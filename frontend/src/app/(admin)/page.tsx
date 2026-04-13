'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api-client';
import { formatBRL, formatDate, getStatusLabel, getStatusBadgeClass } from '@/lib/utils';

interface DashboardStats {
  users: { total: number; active: number; inactive: number; admins: number; clients: number };
  reservations: { total: number; pending: number; confirmed: number; cancelled: number; completed: number; upcoming: number };
  health: { status: string; checks: Record<string, { status: string }> };
}

interface RecentReservation {
  id: string;
  date: string;
  status: string;
  user: { name: string; email: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userStats, reservationStats, health, reservationsRes] = await Promise.all([
          api.get('/api/v1/users/admin/stats'),
          api.get('/api/v1/reservations/admin/stats'),
          api.get('/health/deep'),
          api.get('/api/v1/reservations?limit=5'),
        ]);

        setStats({
          users: userStats.data,
          reservations: reservationStats.data,
          health,
        });
        setRecentReservations(reservationsRes.data.reservations || []);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">🧤</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[var(--text-primary)]">
          Painel Administrativo
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Visão geral da Luvaria Ulisses
        </p>
      </div>

      {/* System Status */}
      <div className="card-luxury p-6">
        <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
        <div className="flex flex-wrap gap-4">
          {stats?.health?.checks && Object.entries(stats.health.checks).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                value.status === 'ok' ? 'bg-green-500' :
                value.status === 'not_configured' ? 'bg-gray-400' : 'bg-red-500'
              }`} />
              <span className="text-sm text-[var(--text-secondary)] capitalize">{key}</span>
              <span className={`text-xs font-medium ${
                value.status === 'ok' ? 'text-green-600' : 'text-red-600'
              }`}>
                {getStatusLabel(value.status) || value.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/produtos" className="card-luxury p-4 text-center hover:border-accent-400 transition-colors">
            <span className="text-3xl">🧤</span>
            <p className="mt-2 text-sm font-medium">Gerenciar Produtos</p>
          </Link>
          <Link href="/admin/clientes" className="card-luxury p-4 text-center hover:border-accent-400 transition-colors">
            <span className="text-3xl">👥</span>
            <p className="mt-2 text-sm font-medium">Gerenciar Clientes</p>
          </Link>
          <Link href="/admin/reservas" className="card-luxury p-4 text-center hover:border-accent-400 transition-colors">
            <span className="text-3xl">📅</span>
            <p className="mt-2 text-sm font-medium">Ver Reservas</p>
          </Link>
          <Link href="/admin/materiais" className="card-luxury p-4 text-center hover:border-accent-400 transition-colors">
            <span className="text-3xl">🧵</span>
            <p className="mt-2 text-sm font-medium">Materiais</p>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clientes */}
        <div className="card-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total de Clientes</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                {stats?.users?.total || 0}
              </p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
          <div className="mt-4 flex gap-3 text-xs text-[var(--text-secondary)]">
            <span className="text-green-600">{stats?.users?.active || 0} ativos</span>
            <span className="text-red-600">{stats?.users?.inactive || 0} inativos</span>
          </div>
        </div>

        {/* Reservas */}
        <div className="card-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Reservas Agendadas</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                {stats?.reservations?.upcoming || 0}
              </p>
            </div>
            <span className="text-4xl">📅</span>
          </div>
          <div className="mt-4 flex gap-3 text-xs text-[var(--text-secondary)]">
            <span className="text-yellow-600">{stats?.reservations?.pending || 0} pendentes</span>
            <span className="text-green-600">{stats?.reservations?.confirmed || 0} confirmadas</span>
          </div>
        </div>

        {/* Produtos */}
        <div className="card-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Produtos Ativos</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                —
              </p>
            </div>
            <span className="text-4xl">🧤</span>
          </div>
          <div className="mt-4">
            <Link href="/admin/produtos" className="text-xs text-accent-400 hover:text-accent-500">
              Gerenciar →
            </Link>
          </div>
        </div>

        {/* Webhook Status */}
        <div className="card-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Integração n8n</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.health?.checks?.n8n?.status === 'ok' ? '✅' : '⚠️'}
              </p>
            </div>
            <span className="text-4xl">🔗</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-[var(--text-secondary)]">
              {stats?.health?.checks?.n8n?.status === 'ok' ? 'Conectado' : 'Verificar configuração'}
            </p>
          </div>
        </div>
      </div>

      {/* Reservas Recentes */}
      <div className="card-luxury">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold">Reservas Recentes</h2>
          <Link href="/admin/reservas" className="text-sm text-accent-400 hover:text-accent-500">
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {recentReservations.length > 0 ? (
            recentReservations.map((res) => (
              <div key={res.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{res.user.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{formatDate(res.date)}</p>
                </div>
                <span className={`badge ${getStatusBadgeClass(res.status)}`}>
                  {getStatusLabel(res.status)}
                </span>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-[var(--text-secondary)] text-sm">
              Nenhuma reserva recente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
