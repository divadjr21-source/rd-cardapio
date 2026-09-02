import { useState } from 'react';
import { Pencil, Trash2, Plus, Eye, EyeOff, ChefHat } from 'lucide-react';
import { useApp } from '../../../context/useApp';
import { CATEGORIAS } from '../../../data/constants';
import ProdutoFormModal from '../components/ProdutoFormModal';

export default function Produtos() {
  const { produtos, salvarProduto, excluirProduto, alternarAtivo } = useApp();
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  const lista = filtroCategoria === 'todas' ? produtos : produtos.filter((p) => p.categoria === filtroCategoria);

  async function handleSalvar(produto) {
    await salvarProduto(editando?.id ? { ...produto, id: editando.id } : produto);
    setMostrarForm(false);
    setEditando(null);
  }

  async function handleExcluir(id) {
    if (!window.confirm('Excluir este produto? Essa ação não pode ser desfeita.')) return;
    await excluirProduto(id);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFiltroCategoria('todas')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
              filtroCategoria === 'todas' ? 'bg-dark text-white' : 'bg-white border border-border text-muted'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setFiltroCategoria(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
                filtroCategoria === c.id ? 'bg-dark text-white' : 'bg-white border border-border text-muted'
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>

        <button
          onClick={() => { setEditando(null); setMostrarForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shrink-0"
        >
          <Plus size={16} /> Novo produto
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-muted text-sm">
          Nenhum produto nessa categoria ainda. Cadastre o primeiro item do seu cardápio.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Categoria</th>
                  <th className="px-6 py-3 font-medium">Preço</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imagem ? (
                            <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                          ) : (
                            <ChefHat size={16} className="text-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark truncate max-w-[220px]">{p.nome}</p>
                          <p className="text-xs text-muted truncate max-w-[220px]">{p.descricao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted">
                      {CATEGORIAS.find((c) => c.id === p.categoria)?.nome || p.categoria}
                    </td>
                    <td className="px-6 py-3 font-semibold text-dark">
                      R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => alternarAtivo(p.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.ativo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                        {p.ativo ? 'Disponível' : 'Oculto'}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setEditando(p); setMostrarForm(true); }}
                          className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluir(p.id)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mostrarForm && (
        <ProdutoFormModal
          produtoInicial={editando}
          onSalvar={handleSalvar}
          onCancelar={() => { setMostrarForm(false); setEditando(null); }}
        />
      )}
    </div>
  );
}
