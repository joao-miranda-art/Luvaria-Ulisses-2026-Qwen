'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { formatDate, getStatusLabel, getStatusBadgeClass, cn } from '@/lib/utils';

interface Reservation {
  id: string;
  date: string;
  notes: string | null;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  createdAt: string;
}

export default function AdminReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  async function fetchReservations() {
    try {
      const params: any = { limit: 50 };
      if (filter) params.status = filter;

      const { data } = await api.get('/api/v1/reservations', { params });
      setReservations(data.reservations);
    } catch {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/v1/reservations/${id}/status`, { status });
      toast.success(`Reserva ${getStatusLabel(status).toLowerCase()}`);
      fetchReservations();
    } catch {
      toast.error('Erro ao atualizar reserva');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[var(--text-primary)]">
            Reservas VIP
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Gerencie os agendamentos de atendimento presencial
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-sm border transition-colors',
              filter === status
                ? 'bg-accent-400 text-white border-accent-400'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-accent-400'
            )}
          >
            {status ? getStatusLabel(status) : 'Todos'}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin text-4xl">📅</div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-[var(--text-secondary)]">Nenhuma reserva encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div key={res.id} className="card-luxury p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge ${getStatusBadgeClass(res.status)}`}>
                      {getStatusLabel(res.status)}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      ID: {res.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[var(--text-primary)]">{res.user.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                    <span>📅 {formatDate(res.date)}</span>
                    {res.user.phone && <span>📱 {res.user.phone}</span>}
                    <span>✉️ {res.user.email}</span>
                  </div>

                  {res.notes && (
                    <p className="mt-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-sm">
                      💬 {res.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {res.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(res.id, 'CONFIRMED')}
                        className="btn-primary text-xs px-4 py-2"
                      >
                        ✅ Confirmar
                      </button>
                      <button
                        onClick={() => updateStatus(res.id, 'CANCELLED')}
                        className="btn-secondary text-xs px-4 py-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        ✕ Cancelar
                      </button>
                    </>
                  )}
                  {res.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus(res.id, 'COMPLETED')}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      ✓ Concluída
                    </button>
                  )}
                  {res.status === 'CANCELLED' && (
                    <button
                      onClick={() => updateStatus(res.id, 'PENDING')}
                      className="btn-secondary text-xs px-4 py-2"
                    >
                      ↩ Reagendar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
