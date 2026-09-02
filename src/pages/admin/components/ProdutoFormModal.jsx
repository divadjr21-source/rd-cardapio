import { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIAS } from '../../../data/constants';

export default function ProdutoFormModal({ produtoInicial, onSalvar, onCancelar }) {
  const [produto, setProduto] = useState(
    produtoInicial || { nome: '', descricao: '', preco: '', imagem: '', categoria: CATEGORIAS[0].id, ativo: true }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produto.nome.trim() || !produto.preco) {
      setErro('Preencha ao menos o nome e o preço.');
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      await onSalvar(produto);
    } catch (err) {
      setErro(err.message || 'Erro ao salvar produto.');
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h2 className="font-bold text-dark">{produtoInicial?.id ? 'Editar produto' : 'Novo produto'}</h2>
          <button onClick={onCancelar} className="p-1 text-muted hover:text-dark">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nome</label>
            <input
              type="text"
              value={produto.nome}
              onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: X-Burguer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Descrição</label>
            <textarea
              value={produto.descricao}
              onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Ingredientes, tamanho, observações..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={produto.preco}
                onChange={(e) => setProduto({ ...produto, preco: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Categoria</label>
              <select
                value={produto.categoria}
                onChange={(e) => setProduto({ ...produto, categoria: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">URL da imagem</label>
            <input
              type="text"
              value={produto.imagem}
              onChange={(e) => setProduto({ ...produto, imagem: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={produto.ativo !== false}
              onChange={(e) => setProduto({ ...produto, ativo: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            Disponível no cardápio
          </label>

          {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 py-2.5 border border-border rounded-xl font-semibold text-sm text-dark hover:bg-bg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm disabled:opacity-70"
            >
              {salvando ? 'Salvando...' : 'Salvar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
