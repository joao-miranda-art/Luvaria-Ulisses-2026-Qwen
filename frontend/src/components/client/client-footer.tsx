'use client';

import Link from 'next/link';

export default function ClientFooter() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-bold text-primary-800 dark:text-primary-600">
              Luvaria Ulisses
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-md">
              Artesanato de luxo em luvas sob medida. Tradição, elegância e exclusividade desde 1925.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">Início</Link></li>
              <li><Link href="/produtos" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">Coleção</Link></li>
              <li><Link href="/reserva-vip" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">Reserva VIP</Link></li>
              <li><Link href="/contato" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li><Link href="/privacidade" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">Termos de Uso</Link></li>
              <li><Link href="/lgpd" className="text-sm text-[var(--text-secondary)] hover:text-accent-400 transition-colors">LGPD</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <p className="text-center text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} Luvaria Ulisses. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
