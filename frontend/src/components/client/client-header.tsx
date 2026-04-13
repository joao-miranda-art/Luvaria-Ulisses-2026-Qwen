'use client';

import Link from 'next/link';
import { useTheme } from '@/components/ui/theme-provider';
import { motion } from 'framer-motion';

export default function ClientHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xl lg:text-2xl font-serif font-bold text-primary-800 dark:text-primary-600">
                Luvaria Ulisses
              </span>
              <span className="hidden sm:block text-xs text-[var(--text-secondary)] tracking-widest uppercase">
                Desde 1925
              </span>
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-accent-400 transition-colors">
              Início
            </Link>
            <Link href="/produtos" className="text-sm font-medium text-[var(--text-secondary)] hover:text-accent-400 transition-colors">
              Coleção
            </Link>
            <Link href="/reserva-vip" className="text-sm font-medium text-[var(--text-secondary)] hover:text-accent-400 transition-colors">
              Reserva VIP
            </Link>
            <Link href="/contato" className="text-sm font-medium text-[var(--text-secondary)] hover:text-accent-400 transition-colors">
              Contato
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="btn-secondary text-xs px-4 py-2">
              Entrar
            </Link>
            <Link href="/reserva-vip" className="btn-primary text-xs px-4 py-2">
              Reservar
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
