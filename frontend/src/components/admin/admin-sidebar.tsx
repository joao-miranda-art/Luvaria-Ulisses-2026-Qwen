'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Painel', href: '/admin', icon: '📊' },
  { name: 'Produtos', href: '/admin/produtos', icon: '🧤' },
  { name: 'Materiais', href: '/admin/materiais', icon: '🧵' },
  { name: 'Reservas VIP', href: '/admin/reservas', icon: '📅' },
  { name: 'Clientes', href: '/admin/clientes', icon: '👥' },
  { name: 'Pedidos', href: '/admin/pedidos', icon: '📦' },
  { name: 'Logs', href: '/admin/logs', icon: '📝' },
  { name: 'Configurações', href: '/admin/configuracoes', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-charcoal rounded-sm shadow-md"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-charcoal border-r border-[var(--border-color)] transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--border-color)]">
            <Link href="/admin" className="block">
              <h1 className="text-lg font-serif font-bold text-primary-800 dark:text-primary-600">
                Luvaria Ulisses
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Painel Administrativo
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-800/10 text-primary-800 dark:text-primary-400'
                      : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-color)]">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors"
            >
              🏠 Ver site
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
