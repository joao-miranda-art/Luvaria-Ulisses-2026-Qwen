'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { formatBRL, formatDate, getStatusLabel, getStatusBadgeClass, cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'ADMIN' | 'CLIENT';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminClientesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  async function fetchUsers() {
    try {
      const { data } = await api.get('/api/v1/users', {
        params: { search, page: pagination.page, limit: 20 },
      });
      setUsers(data.users);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserStatus(user: User) {
    try {
      const { data } = await api.patch(`/api/v1/auth/users/${user.id}/toggle-status`);
      toast.success(data.isActive ? 'Conta ativada' : 'Conta desativada');
      fetchUsers();
    } catch {
      toast.error('Erro ao alterar status');
    }
  }

  async function resetPassword(userId: string) {
    const newPassword = prompt('Nova senha para o usuário:');
    if (!newPassword || newPassword.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      await api.put(`/api/v1/auth/users/${userId}/reset-password`, { newPassword });
      toast.success('Senha resetada com sucesso');
    } catch {
      toast.error('Erro ao resetar senha');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[var(--text-primary)]">
            Gerenciar Clientes
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {pagination.total} cliente(s) cadastrado(s)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportCSV(true)}
            className="btn-secondary text-sm"
          >
            📥 Importar CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-sm"
          >
            + Novo Cliente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="input-luxury max-w-md"
        />
      </div>

      {/* Table */}
      <div className="card-luxury overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            <tr>
              <th className="text-left p-4 font-medium text-[var(--text-secondary)]">Nome</th>
              <th className="text-left p-4 font-medium text-[var(--text-secondary)]">E-mail</th>
              <th className="text-left p-4 font-medium text-[var(--text-secondary)] hidden md:table-cell">Telefone</th>
              <th className="text-left p-4 font-medium text-[var(--text-secondary)] hidden lg:table-cell">Tipo</th>
              <th className="text-left p-4 font-medium text-[var(--text-secondary)]">Status</th>
              <th className="text-right p-4 font-medium text-[var(--text-secondary)]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Carregando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">Nenhum cliente encontrado</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--bg-secondary)]/50">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{user.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="p-4 text-[var(--text-secondary)] hidden md:table-cell">{user.phone || '—'}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      user.role === 'ADMIN' ? 'bg-primary-800/10 text-primary-800' : 'bg-gray-100 text-gray-600'
                    )}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'badge',
                      user.isActive ? 'badge-confirmed' : 'badge-cancelled'
                    )}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className="text-xs text-accent-400 hover:text-accent-500"
                        title={user.isActive ? 'Desativar conta' : 'Ativar conta'}
                      >
                        {user.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => resetPassword(user.id)}
                        className="text-xs text-yellow-600 hover:text-yellow-700"
                        title="Resetar senha"
                      >
                        🔑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-luxury p-6 max-w-md w-full">
            <h2 className="text-xl font-serif font-bold mb-4">Novo Cliente</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Em produção: formulário com nome, e-mail, telefone e senha temporária.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-primary w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Import CSV Modal placeholder */}
      {showImportCSV && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-luxury p-6 max-w-lg w-full">
            <h2 className="text-xl font-serif font-bold mb-4">Importar Clientes via CSV</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Formato do CSV: <code className="bg-[var(--bg-secondary)] px-1 rounded">email,name,phone,role</code>
            </p>
            <textarea
              className="input-luxury font-mono text-xs"
              rows={6}
              placeholder={`email,name,phone,role\njoao@email.com,João Silva,5511999999999,CLIENT\nmaria@email.com,Maria Santos,,CLIENT`}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowImportCSV(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button className="btn-primary flex-1">
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
