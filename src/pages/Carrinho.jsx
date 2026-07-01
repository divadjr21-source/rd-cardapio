import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, Send, ShoppingBag, Loader2 } from 'lucide-react';
import { useApp } from '../context/useApp';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';

export default function Carrinho() {
  const navigate = useNavigate();
  const slug = useRestauranteSlug();
  const {
    config,
    carrinho,
    total,
    observacoes,
    setObservacoes,
    atualizarQuantidade,
    removerDoCarrinho,
  } = useApp();

  const restaurantePronto = Boolean(config?.id);

  if (!restaurantePronto) {
    return (
      <div className="min-h-[100svh] bg-bg flex flex-col items-center justify-center px-6 text-center">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-muted text-sm">Carregando dados da loja...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-bg pb-40">
      <header className="bg-dark text-light">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(`/${slug}/cardapio`)} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold">Seu pedido</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-4">
        {carrinho.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow">
              <ShoppingBag className="text-muted" size={28} />
            </div>
            <p className="text-muted">Seu carrinho está vazio.</p>
            <button
              onClick={() => navigate(`/${slug}/cardapio`)}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-semibold"
            >
              Ver cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {carrinho.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 border border-border flex gap-3"
                >
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-dark">{item.nome}</h3>
                      <p className="text-sm text-muted">{item.descricao}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removerDoCarrinho(item.id)}
                          className="ml-1 p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-white rounded-2xl p-4 border border-border">
              <label className="block text-sm font-semibold text-dark mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: sem cebola, maionese à parte..."
                className="w-full min-h-[80px] px-3 py-2 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="mt-5 bg-white rounded-2xl p-4 border border-border flex items-center justify-between">
              <span className="text-muted">Total do pedido</span>
              <span className="text-2xl font-bold text-primary">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </>
        )}
      </main>

      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate(`/${slug}/checkout`)}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Send size={20} />
              Finalizar pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
