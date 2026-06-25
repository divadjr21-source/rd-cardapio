import { Plus } from 'lucide-react';

export default function ProdutoCard({ produto, onAdicionar }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
      <img
        src={produto.imagem}
        alt={produto.nome}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-dark">{produto.nome}</h3>
          <p className="text-sm text-muted mt-1 line-clamp-2">{produto.descricao}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={() => onAdicionar(produto)}
            className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-full transition-colors"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
