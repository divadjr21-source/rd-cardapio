import { Plus, ChefHat } from 'lucide-react';

export default function ProdutoCard({ produto, onAdicionar }) {
  const preco = Number(produto.preco).toFixed(2).replace('.', ',');

  return (
    <div
      className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg"
      style={{ borderRadius: 'var(--border-radius, 1rem)' }}
    >
      <div className="relative w-full h-28 overflow-hidden bg-gray-100">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-muted"
            style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}
          >
            <ChefHat size={32} />
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col flex-grow">
        <h3 className="font-bold text-sm text-dark line-clamp-1">{produto.nome}</h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{produto.descricao}</p>
      </div>

      <div className="flex items-center justify-between mt-auto p-2 pt-0">
        <span className="text-sm font-bold" style={{ color: 'var(--primary-color, #ef4444)' }}>
          R$ {preco}
        </span>
        <button
          onClick={() => onAdicionar(produto)}
          className="text-white p-1.5 rounded-full transition-all duration-200 active:scale-90"
          style={{ backgroundColor: 'var(--primary-color, #ef4444)' }}
          aria-label="Adicionar"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
