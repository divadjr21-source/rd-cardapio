import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, UtensilsCrossed, Star, Clock, Search } from 'lucide-react';
import { useApp } from '../context/useApp';
import ProdutoCard from '../components/ProdutoCard';
import { CATEGORIAS } from '../data/constants';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';

export default function Cardapio() {
  const navigate = useNavigate();
  const slug = useRestauranteSlug();
  const { config, produtosAtivos, carrinho, adicionarAoCarrinho, carregando } = useApp();
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');

  const termoBusca = busca.trim().toLowerCase();

  const filtrados = produtosAtivos.filter((p) => {
    const pertenceCategoria = categoriaAtiva === 'todas' || p.categoria === categoriaAtiva;
    const combinaBusca =
      !termoBusca ||
      p.nome.toLowerCase().includes(termoBusca) ||
      (p.descricao || '').toLowerCase().includes(termoBusca);
    return pertenceCategoria && combinaBusca;
  });

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const totalPreco = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const bgColor = 'var(--bg-color, #0f172a)';
  const primaryColor = 'var(--primary-color, #ef4444)';

  const categoriasComProdutos = CATEGORIAS.filter((cat) =>
    produtosAtivos.some((p) => p.categoria === cat.id)
  );

  return (
    <div className="min-h-[100svh] pb-32" style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}>
      <header
        className="sticky top-0 z-20 text-light shadow-lg"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-md mx-auto px-4 pt-6 pb-4 flex items-center gap-4">
          {config.logo ? (
            <img
              src={config.logo}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/15 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-md">
              <Store size={28} style={{ color: primaryColor }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate tracking-tight">{config.nome || '...'}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400" fill="currentColor" />
                4.9 (120+)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Aberto até 23:00
              </span>
            </div>
          </div>
        </div>

        <div
          className="max-w-md mx-auto px-4 pb-3"
          style={{
            background: `linear-gradient(to bottom, ${bgColor}, rgba(255,255,255,0.92))`,
          }}
        >
          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(28,30,34,0.85)',
                '--tw-ring-color': 'var(--primary-color, #ef4444)',
              }}
            />
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide"
            style={{ maskImage: 'linear-gradient(to right, black 90%, transparent 100%)' }}
          >
            {produtosAtivos.length > 0 && (
              <button
                onClick={() => setCategoriaAtiva('todas')}
                className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-sm"
                style={{
                  backgroundColor: categoriaAtiva === 'todas' ? bgColor : 'rgba(255,255,255,0.9)',
                  color: categoriaAtiva === 'todas' ? '#fff' : '#111',
                  borderColor: categoriaAtiva === 'todas' ? 'transparent' : 'rgba(0,0,0,0.06)',
                }}
              >
                Todos
              </button>
            )}
            {categoriasComProdutos.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-sm"
                style={{
                  backgroundColor: categoriaAtiva === cat.id ? bgColor : 'rgba(255,255,255,0.9)',
                  color: categoriaAtiva === cat.id ? '#fff' : '#111',
                  borderColor: categoriaAtiva === cat.id ? 'transparent' : 'rgba(0,0,0,0.06)',
                }}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      </header>

      {carregando && (
        <main className="bg-gray-50 p-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="w-full h-28 bg-gray-100 skeleton" />
              <div className="p-2 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded skeleton" />
                <div className="h-3 w-full bg-gray-200 rounded skeleton" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-14 bg-gray-200 rounded skeleton" />
                  <div className="h-7 w-7 bg-gray-200 rounded-full skeleton" />
                </div>
              </div>
            </div>
          ))}
        </main>
      )}

      {!carregando && (
        <main className="bg-gray-50 p-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtrados.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted flex flex-col items-center gap-3">
              <UtensilsCrossed size={40} className="text-border" />
              <p className="text-sm">
                {termoBusca
                  ? 'Nenhum produto encontrado para sua busca.'
                  : 'Nenhum produto disponível nesta categoria.'}
              </p>
            </div>
          ) : (
            filtrados.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} onAdicionar={adicionarAoCarrinho} />
            ))
          )}
        </main>
      )}

      {totalItens > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 px-4 pb-5 pt-2"
          style={{
            background: 'linear-gradient(to top, var(--bg-color, #f3f4f6), rgba(255,255,255,0))',
          }}
        >
          <button
            onClick={() => navigate(`/${slug}/carrinho`)}
            className="w-full max-w-md mx-auto flex items-center justify-between px-5 py-4 text-white rounded-2xl transition-all duration-300 active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}
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
