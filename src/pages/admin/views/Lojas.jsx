import { useEffect, useState } from 'react';
import { Plus, ExternalLink, Power, Trash2, Store } from 'lucide-react';
import { useApp } from '../../../context/useApp';

function normalizarSlug(valor) {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Lojas({ onGerenciarLoja }) {
  const { listarRestaurantes, criarRestaurante, atualizarStatusRestaurante, excluirRestaurante } = useApp();
  const [lojas, setLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nova, setNova] = useState({ slug: '', nome_comercial: '', whatsapp_contato: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    try {
      const data = await listarRestaurantes();
      setLojas(data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCriar(e) {
    e.preventDefault();
    if (!nova.slug || !nova.nome_comercial) {
      setErro('Preencha nome e identificador (slug) da loja.');
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      await criarRestaurante(nova);
      setNova({ slug: '', nome_comercial: '', whatsapp_contato: '' });
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(err.message || 'Erro ao criar loja.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleStatus(id, statusAtual) {
    await atualizarStatusRestaurante(id, statusAtual === 'ativo' ? 'inativo' : 'ativo');
    await carregar();
  }

  async function handleExcluir(id, nome) {
    if (!window.confirm(`Excluir a loja "${nome}"? Produtos, pedidos e usuários vinculados serão apagados permanentemente.`)) return;
    await excluirRestaurante(id);
    await carregar();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{lojas.length} loja{lojas.length !== 1 ? 's' : ''} cadastrada{lojas.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Nova loja
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCriar} className="bg-white rounded-2xl border border-border p-5 grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1">Nome comercial</label>
            <input
              type="text"
              value={nova.nome_comercial}
              onChange={(e) => setNova({ ...nova, nome_comercial: e.target.value, slug: normalizarSlug(e.target.value) })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
              placeholder="Ex: Burger House"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Slug (URL)</label>
            <input
              type="text"
              value={nova.slug}
              onChange={(e) => setNova({ ...nova, slug: normalizarSlug(e.target.value) })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
              placeholder="burger-house"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">WhatsApp</label>
            <input
              type="text"
              value={nova.whatsapp_contato}
              onChange={(e) => setNova({ ...nova, whatsapp_contato: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
              placeholder="55DDDNÚMERO"
            />
          </div>
          {erro && <p className="sm:col-span-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>}
          <div className="sm:col-span-3 flex gap-3">
            <button type="submit" disabled={salvando} className="px-5 py-2.5 bg-dark text-white rounded-xl text-sm font-semibold disabled:opacity-70">
              {salvando ? 'Criando...' : 'Criar loja'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {carregando ? (
          <div className="p-6 text-sm text-muted">Carregando lojas...</div>
        ) : lojas.length === 0 ? (
          <div className="p-10 text-center text-muted text-sm">Nenhuma loja cadastrada ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Loja</th>
                  <th className="px-6 py-3 font-medium">WhatsApp</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lojas.map((loja) => (
                  <tr key={loja.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-bg flex items-center justify-center shrink-0">
                          <Store size={16} className="text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-dark">{loja.nome_comercial}</p>
                          <p className="text-xs text-muted">/{loja.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted">{loja.whatsapp_contato || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        loja.status === 'ativo' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {loja.status === 'ativo' ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onGerenciarLoja(loja)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg"
                        >
                          Gerenciar
                        </button>
                        <a
                          href={`${window.location.origin}/#/${loja.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-muted hover:text-dark hover:bg-bg rounded-lg"
                          title="Ver cardápio"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleStatus(loja.id, loja.status)}
                          className="p-2 text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          title={loja.status === 'ativo' ? 'Desativar loja' : 'Ativar loja'}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluir(loja.id, loja.nome_comercial)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Excluir loja"
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
        )}
      </div>
    </div>
  );
}
