'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { formatBRL, formatDate } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | string;
  category: string;
  isActive: boolean;
  images: string[];
  createdAt: string;
}

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data } = await api.get('/api/v1/products');
      setProducts(data.products);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingProduct) {
        await api.put(`/api/v1/products/${editingProduct.id}`, {
          ...form,
          basePrice: parseFloat(form.basePrice),
        });
        toast.success('Produto atualizado!');
      } else {
        await api.post('/api/v1/products', {
          ...form,
          basePrice: parseFloat(form.basePrice),
        });
        toast.success('Produto criado!');
      }
      setShowForm(false);
      setEditingProduct(null);
      setForm({ name: '', description: '', basePrice: '', category: '' });
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar produto');
    }
  }

  async function toggleProduct(product: Product) {
    try {
      await api.put(`/api/v1/products/${product.id}`, { isActive: !product.isActive });
      toast.success(product.isActive ? 'Produto desativado' : 'Produto ativado');
      fetchProducts();
    } catch {
      toast.error('Erro ao alterar produto');
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;
    try {
      await api.delete(`/api/v1/products/${id}`);
      toast.success('Produto deletado');
      fetchProducts();
    } catch {
      toast.error('Erro ao deletar produto');
    }
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      basePrice: String(product.basePrice),
      category: product.category,
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[var(--text-primary)]">
            Gerenciar Produtos
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {products.length} produto(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setForm({ name: '', description: '', basePrice: '', category: '' });
          }}
          className="btn-primary text-sm"
        >
          + Novo Produto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card-luxury p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif font-bold mb-6">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-luxury"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-luxury resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço Base (R$) *</label>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm(prev => ({ ...prev, basePrice: e.target.value }))}
                    className="input-luxury"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria *</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input-luxury"
                    required
                    placeholder="ex: Clássica"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingProduct(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin text-4xl">🧤</div>
        </div>
      ) : products.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <p className="text-5xl mb-4">🧤</p>
          <p className="text-[var(--text-secondary)]">Nenhum produto cadastrado</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4"
          >
            Cadastrar Primeiro Produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card-luxury overflow-hidden">
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-leather-100 to-leather-200 dark:from-charcoal dark:to-leather-900 flex items-center justify-center">
                {product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl opacity-30">🧤</span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-accent-400">{product.category}</span>
                    <h3 className="font-serif font-semibold text-[var(--text-primary)]">{product.name}</h3>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <p className="text-2xl font-bold text-primary-800 dark:text-primary-400 mt-2">
                  {formatBRL(product.basePrice)}
                </p>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => startEdit(product)} className="text-xs text-accent-400 hover:text-accent-500">
                    ✏️ Editar
                  </button>
                  <button onClick={() => toggleProduct(product)} className="text-xs text-yellow-600 hover:text-yellow-700">
                    {product.isActive ? '⏸️ Desativar' : '▶️ Ativar'}
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="text-xs text-red-600 hover:text-red-700">
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
