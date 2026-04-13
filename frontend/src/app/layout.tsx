import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'Luvaria Ulisses — Luvas Sob Medida Desde 1925',
    template: '%s | Luvaria Ulisses',
  },
  description: 'Artesanato de luxo em luvas sob medida. Tradição, elegância e exclusividade desde 1925. Agende sua Reserva VIP.',
  keywords: ['luvas de couro', 'luvas sob medida', 'artesanato de luxo', 'Luvaria Ulisses'],
  authors: [{ name: 'Luvaria Ulisses' }],
  openGraph: {
    title: 'Luvaria Ulisses — Luvas Sob Medida Desde 1925',
    description: 'Artesanato de luxo em luvas sob medida. Tradição e exclusividade.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Luvaria Ulisses',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)]">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
