import { Plus, ChefHat } from 'lucide-react';

export default function ProdutoCard({ produto, onAdicionar }) {
  const preco = Number(produto.preco).toFixed(2).replace('.', ',');

  return (
    <div
      className="group bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col animate-fade-up"
      style={{ borderRadius: 'var(--border-radius, 1rem)' }}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted"
            style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}
          >
            <ChefHat size={40} />
            <span className="text-xs mt-2">Sem imagem</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-dark tracking-tight">{produto.nome}</h3>
          <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">{produto.descricao}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-extrabold" style={{ color: 'var(--primary-color, #ef4444)' }}>R$ {preco}</span>
          <button
            onClick={() => onAdicionar(produto)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-light text-sm font-semibold rounded-full transition-all duration-300 active:scale-95 shadow-lg"
            style={{ backgroundColor: 'var(--bg-color, #0f172a)' }}
          >
            <Plus size={16} strokeWidth={3} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
