import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/useApp';
import ProdutoCard from '../components/ProdutoCard';
import { CATEGORIAS } from '../data/constants';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';

export default function Cardapio() {
  const navigate = useNavigate();
  const slug = useRestauranteSlug();
  const { config, produtosAtivos, carrinho, adicionarAoCarrinho, carregando } = useApp();
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');

  const filtrados =
    categoriaAtiva === 'todas'
      ? produtosAtivos
      : produtosAtivos.filter((p) => p.categoria === categoriaAtiva);

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const totalPreco = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  return (
    <div
      className="min-h-[100svh] pb-32"
      style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}
    >
      <header
        className="sticky top-0 z-20 text-light border-b border-white/5 shadow-lg"
        style={{ backgroundColor: 'var(--bg-color, #0f172a)' }}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          {config.logo ? (
            <img
              src={config.logo}
              alt=""
              className="w-11 h-11 rounded-full object-cover border-2 border-white/10 shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
              <Store size={22} style={{ color: 'var(--primary-color, #ef4444)' }} />
            </div>
          )}
          <div className="flex-1 min-w-0 ml-1">
            <h1 className="text-base font-bold truncate tracking-tight">{config.nome || '...'}</h1>
            <p className="text-xs text-gray-400">Cardápio digital</p>
          </div>
        </div>
      </header>

      <section className="sticky top-[72px] z-10 max-w-md mx-auto px-4 pt-4 pb-2"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border"
            style={{
              backgroundColor: categoriaAtiva === 'todas' ? 'var(--bg-color, #0f172a)' : '#fff',
              color: categoriaAtiva === 'todas' ? '#fff' : '#111',
              borderColor: categoriaAtiva === 'todas' ? 'var(--bg-color, #0f172a)' : '#e5e7eb',
            }}
          >
            Todos
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border"
              style={{
                backgroundColor: categoriaAtiva === cat.id ? 'var(--bg-color, #0f172a)' : '#fff',
                color: categoriaAtiva === cat.id ? '#fff' : '#111',
                borderColor: categoriaAtiva === cat.id ? 'var(--bg-color, #0f172a)' : '#e5e7eb',
              }}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </section>

      {carregando && (
        <main className="max-w-md mx-auto px-4 mt-6 grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
            >
              <div className="w-full aspect-[4/3] bg-gray-100 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded skeleton" />
                <div className="h-4 w-full bg-gray-200 rounded skeleton" />
                <div className="h-4 w-3/4 bg-gray-200 rounded skeleton" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-6 w-20 bg-gray-200 rounded skeleton" />
                  <div className="h-10 w-28 bg-gray-200 rounded-full skeleton" />
                </div>
              </div>
            </div>
          ))}
        </main>
      )}

      {!carregando && (
        <main className="max-w-md mx-auto px-4 mt-6 grid grid-cols-1 gap-5">
          {filtrados.length === 0 ? (
            <div className="text-center py-16 text-muted flex flex-col items-center gap-3">
              <UtensilsCrossed size={40} className="text-border" />
              <p className="text-sm">Nenhum produto disponível nesta categoria.</p>
            </div>
          ) : (
            filtrados.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} onAdicionar={adicionarAoCarrinho} />
            ))
          )}
        </main>
      )}

      {totalItens > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-5 pt-2"
          style={{ background: 'linear-gradient(to top, var(--bg-color, #f3f4f6), rgba(255,255,255,0))' }}
        >
          <button
            onClick={() => navigate(`/${slug}/carrinho`)}
            className="w-full max-w-md mx-auto flex items-center justify-between px-5 py-4 text-white rounded-2xl transition-all duration-300 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--primary-color, #ef4444)' }}
          >
            <span className="flex items-center gap-2.5 font-bold">
              <ShoppingCart size={20} />
              Ver pedido
              <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                {totalItens}
              </span>
            </span>
            <span className="font-extrabold text-lg">
              R$ {totalPreco.toFixed(2).replace('.', ',')}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
