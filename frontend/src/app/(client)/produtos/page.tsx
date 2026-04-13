'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatBRL } from '@/lib/utils';
import api from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | string;
  category: string;
  isActive: boolean;
  images: string[];
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await api.get('/api/v1/products');
        setProducts(data.products);
        const cats = [...new Set(data.products.map((p: Product) => p.category))];
        setCategories(cats);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filtered = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-400 mb-4">
          Nossa Coleção
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-800 dark:text-primary-600">
          Luvas Sob Medida
        </h1>
        <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
          Cada par é feito à mão com materiais selecionados. Escolha seu modelo,
          materiais e agende uma Reserva VIP para experimentar pessoalmente.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 text-sm rounded-sm border transition-colors ${
              !selectedCategory
                ? 'bg-accent-400 text-white border-accent-400'
                : 'border-[var(--border-color)] hover:border-accent-400'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm rounded-sm border transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent-400 text-white border-accent-400'
                  : 'border-[var(--border-color)] hover:border-accent-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin text-4xl">🧤</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🧤</p>
          <p className="text-[var(--text-secondary)]">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-luxury overflow-hidden group"
            >
              {/* Image */}
              <div className="aspect-[4/5] bg-gradient-to-br from-leather-200 to-leather-100 dark:from-charcoal dark:to-leather-900 flex items-center justify-center relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-6xl opacity-30">🧤</span>
                )}
              </div>

              <div className="p-6">
                <span className="text-xs uppercase tracking-wider text-accent-400">
                  {product.category}
                </span>
                <h3 className="mt-2 text-lg font-serif font-semibold text-[var(--text-primary)]">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary-800 dark:text-primary-400">
                    {formatBRL(product.basePrice)}
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
      )}

      {/* CTA */}
      <div className="text-center mt-16">
        <p className="text-[var(--text-secondary)] mb-4">
          Quer experimentar pessoalmente?
        </p>
        <Link href="/reserva-vip" className="btn-primary text-base px-8 py-4">
          Agendar Reserva VIP
        </Link>
      </div>
    </div>
  );
}
