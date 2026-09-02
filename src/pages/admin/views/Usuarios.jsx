import { useEffect, useState } from 'react';
import { Plus, Power, Trash2, UserRound } from 'lucide-react';
import { useApp } from '../../../context/useApp';

export default function Usuarios() {
  const { listarUsuarios, listarRestaurantes, criarUsuarioLojista, excluirUsuario, atualizarStatusUsuario } = useApp();
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ email: '', senha: '', nome: '', restaurante_id: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    try {
      const [dadosUsuarios, dadosLojas] = await Promise.all([listarUsuarios(), listarRestaurantes()]);
      setUsuarios(dadosUsuarios);
      setLojas(dadosLojas);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCriar(e) {
    e.preventDefault();
    if (!novo.email || !novo.senha || !novo.restaurante_id) {
      setErro('Preencha email, senha e selecione a loja.');
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      await criarUsuarioLojista(novo);
      setNovo({ email: '', senha: '', nome: '', restaurante_id: '' });
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(err.message || 'Erro ao criar usuário.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleStatus(id, ativo) {
    await atualizarStatusUsuario(id, !ativo);
    await carregar();
  }

  async function handleExcluir(id, email) {
    if (!window.confirm(`Remover o acesso de "${email}"? Essa ação não pode ser desfeita.`)) return;
    await excluirUsuario(id);
    await carregar();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} lojista{usuarios.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold"
        >
          <Plus size={16} /> Novo usuário
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCriar} className="bg-white rounded-2xl border border-border p-5 grid sm:grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1">Nome</label>
            <input
              type="text"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Loja</label>
            <select
              value={novo.restaurante_id}
              onChange={(e) => setNovo({ ...novo, restaurante_id: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
            >
              <option value="">Selecione...</option>
              {lojas.map((l) => (
                <option key={l.id} value={l.id}>{l.nome_comercial}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              value={novo.email}
              onChange={(e) => setNovo({ ...novo, email: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Senha provisória</label>
            <input
              type="text"
              value={novo.senha}
              onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm"
            />
          </div>
          {erro && <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>}
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={salvando} className="px-5 py-2.5 bg-dark text-white rounded-xl text-sm font-semibold disabled:opacity-70">
              {salvando ? 'Criando...' : 'Criar usuário'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {carregando ? (
          <div className="p-6 text-sm text-muted">Carregando usuários...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-10 text-center text-muted text-sm">Nenhum usuário lojista cadastrado ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Usuário</th>
                  <th className="px-6 py-3 font-medium">Loja</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-bg flex items-center justify-center shrink-0">
                          <UserRound size={16} className="text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-dark">{u.nome || u.email}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted">{u.restaurantes?.nome_comercial || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.ativo !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.ativo !== false ? 'Ativo' : 'Desativado'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleStatus(u.id, u.ativo !== false)}
                          className="p-2 text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          title={u.ativo !== false ? 'Desativar acesso' : 'Ativar acesso'}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluir(u.id, u.email)}
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Excluir usuário"
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
