import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
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

  return (
    <div className="min-h-[100svh] bg-bg pb-28">
      <header className="sticky top-0 z-20 bg-dark text-light shadow">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10"></div>
          {config.logo ? (
            <img src={config.logo} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <Store size={28} className="text-primary" />
          )}
          <div className="flex-1 min-w-0 ml-1">
            <h1 className="text-base font-bold truncate">{config.nome}</h1>
            <p className="text-xs text-gray-400">Cardápio digital</p>
          </div>
        </div>
      </header>

      <section className="max-w-md mx-auto px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              categoriaAtiva === 'todas'
                ? 'bg-primary text-white'
                : 'bg-white text-dark border border-border'
            }`}
          >
            Todos
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                categoriaAtiva === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-dark border border-border'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </section>

      <main className="max-w-md mx-auto px-4 mt-6 grid grid-cols-1 gap-4">
        {carregando && (
          <div className="text-center py-12 text-muted">Carregando produtos...</div>
        )}
        {!carregando && filtrados.map((produto) => (
          <ProdutoCard key={produto.id} produto={produto} onAdicionar={adicionarAoCarrinho} />
        ))}
        {!carregando && filtrados.length === 0 && (
          <div className="text-center py-12 text-muted">
            Nenhum produto disponível nesta categoria.
          </div>
        )}
      </main>

      {totalItens > 0 && (
        <button
          onClick={() => navigate(`/${slug}/carrinho`)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-md flex items-center justify-between px-5 py-4 bg-primary text-white rounded-2xl shadow-2xl transition-transform active:scale-95"
        >
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingCart size={20} />
            Ver pedido
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            {totalItens} {totalItens === 1 ? 'item' : 'itens'}
          </span>
        </button>
      )}
    </div>
  );
}
