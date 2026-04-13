'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatBRL } from '@/lib/utils';

// Dados simulados — em produção virão da API
const featuredProducts = [
  {
    id: '1',
    name: 'Luva Clássica de Cabrito',
    description: 'A luva icônica da Luvaria Ulisses. Couro de cabrito italiano com acabamento artesanal.',
    price: 890,
    category: 'Clássica',
    image: '/images/placeholder-glove-1.jpg',
  },
  {
    id: '2',
    name: 'Luva de Cerimônia',
    description: 'Elegância suprema para ocasiões especiais. Couro extra fino com forro de seda.',
    price: 1290,
    category: 'Cerimônia',
    image: '/images/placeholder-glove-2.jpg',
  },
  {
    id: '3',
    name: 'Luva de Motorista',
    description: 'Design vintage com aberturas para máximo controle ao volante.',
    price: 750,
    category: 'Motorista',
    image: '/images/placeholder-glove-3.jpg',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-leather-500">
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
        >
          <p className="text-sm md:text-base uppercase tracking-[0.3em] text-accent-400 mb-4">
            Desde 1925
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6">
            Luvaria Ulisses
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
            Luvas sob medida feitas à mão com a tradição e o cuidado artesanal de quase um século.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserva-vip" className="btn-primary text-base px-8 py-4 bg-accent-400 hover:bg-accent-500">
              Agendar Reserva VIP
            </Link>
            <Link href="/produtos" className="btn-secondary text-base px-8 py-4 border-white text-white hover:bg-white hover:text-primary-800">
              Ver Coleção
            </Link>
          </div>
        </motion.div>

        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </section>

      {/* Tradição */}
      <section className="py-16 lg:py-24 bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-accent-400 mb-4">
              Tradição & Excelência
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-800 dark:text-primary-600 mb-6">
              Quase um século de arte
            </h2>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-3xl mx-auto">
              Desde 1925, a Luvaria Ulisses cria luvas que são verdadeiras obras de arte artesanal.
              Cada par é feito à mão, com materiais selecionados e a atenção aos detalhes que
              só a tradição pode oferecer. Sua experiência começa com uma Reserva VIP exclusiva.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16 lg:py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-accent-400 mb-4">
              Nossa Coleção
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-800 dark:text-primary-600">
              Produtos em Destaque
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-luxury overflow-hidden group"
              >
                {/* Image placeholder */}
                <div className="aspect-[4/5] bg-gradient-to-br from-leather-200 to-leather-100 dark:from-charcoal dark:to-leather-900 flex items-center justify-center">
                  <span className="text-6xl opacity-30">🧤</span>
                </div>

                <div className="p-6">
                  <span className="text-xs uppercase tracking-wider text-accent-400">
                    {product.category}
                  </span>
                  <h3 className="mt-2 text-lg font-serif font-semibold text-[var(--text-primary)]">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary-800 dark:text-primary-400">
                      {formatBRL(product.price)}
                    </span>
                    <Link
                      href={`/produtos/${product.id}`}
                      className="text-sm font-medium text-accent-400 hover:text-accent-500 transition-colors"
                    >
                      Ver detalhes →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/produtos" className="btn-primary">
              Ver Coleção Completa
            </Link>
          </div>
        </div>
      </section>

      {/* Reserva VIP CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary-800 to-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-accent-400 mb-4">
              Experiência Exclusiva
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Reserva VIP
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Agende um atendimento presencial exclusivo e experimente a coleção com
              atenção personalizada. Escolha materiais, forros e tamanhos com a ajuda
              dos nossos artesãos especialistas.
            </p>
            <Link href="/reserva-vip" className="btn-primary text-base px-10 py-4 bg-accent-400 hover:bg-accent-500">
              Agendar Minha Reserva
            </Link>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-12 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            Dúvidas? Fale conosco diretamente:
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            💬 WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
