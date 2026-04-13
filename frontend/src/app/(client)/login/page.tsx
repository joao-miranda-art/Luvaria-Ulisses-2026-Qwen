'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api-client';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem('luvaria-access-token', accessToken);

      toast.success(`Bem-vindo, ${user.name}!`);

      // Redirecionar baseado na role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-leather-500 px-4">
      <div className="w-full max-w-md">
        <div className="card-luxury p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-primary-800 dark:text-primary-600">
              Luvaria Ulisses
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Acesse sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxury"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-luxury"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 text-center text-xs text-white/60">
          <p>Demo Admin: admin@luvariaulisses.com / Admin@2026!</p>
          <p>Demo Client: cliente@exemplo.com / Cliente@2026!</p>
        </div>
      </div>
    </div>
  );
}
