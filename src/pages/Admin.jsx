import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Save,
  Trash2,
  Power,
  QrCode,
  Store,
  LogOut,
  BarChart3,
  Users,
  Home,
  Utensils,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { CATEGORIAS } from '../data/constants';
import { QRCodeCanvas } from 'qrcode.react';

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function hoje() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function primeiroDiaMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function ProdutoForm({ produtoInicial, onSalvar, onCancelar, restauranteId }) {
  const [produto, setProduto] = useState(
    produtoInicial || {
      nome: '',
      descricao: '',
      preco: '',
      imagem: '',
      categoria: CATEGORIAS[0].id,
      ativo: true,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({
      ...produto,
      preco: parseFloat(produto.preco) || 0,
      restaurante_id: restauranteId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-border space-y-3 mt-4">
      <h3 className="font-bold text-dark">
        {produtoInicial ? 'Editar produto' : 'Novo produto'}
      </h3>
      <input
        required
        placeholder="Nome"
        value={produto.nome}
        onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
      />
      <textarea
        required
        placeholder="Descrição"
        value={produto.descricao}
        onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm min-h-[60px]"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="Preço"
          value={produto.preco}
          onChange={(e) => setProduto({ ...produto, preco: e.target.value })}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
        />
        <select
          value={produto.categoria}
          onChange={(e) => setProduto({ ...produto, categoria: e.target.value })}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>
      <input
        required
        placeholder="URL da imagem"
        value={produto.imagem}
        onChange={(e) => setProduto({ ...produto, imagem: e.target.value })}
        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
      />
      {produto.imagem && (
        <img src={produto.imagem} alt="" className="h-24 w-full object-cover rounded-lg" />
      )}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-1"
        >
          <Save size={16} /> Salvar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2.5 bg-gray-100 text-dark rounded-xl font-semibold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const {
    config,
    produtos,
    salvarProduto,
    excluirProduto,
    alternarAtivo,
    usuario,
    perfil,
    isSuperAdmin,
    isLojista,
    restaurantes,
    logoutAdmin,
    salvarConfiguracoes,
    listarRestaurantes,
    criarRestaurante,
    criarUsuarioLojista,
    listarPedidos,
    selecionarRestaurante,
  } = useApp();

  const [editando, setEditando] = useState(null);
  const [aba, setAba] = useState('produtos');
  const [configLocal, setConfigLocal] = useState(config);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [periodoInicio, setPeriodoInicio] = useState(primeiroDiaMes());
  const [periodoFim, setPeriodoFim] = useState(hoje());

  // Super Admin forms
  const [novoRestaurante, setNovoRestaurante] = useState({ slug: '', nome_comercial: '', whatsapp_contato: '' });
  const [novoUsuario, setNovoUsuario] = useState({ email: '', senha: '', nome: '', restaurante_id: '' });
  const [salvandoSuper, setSalvandoSuper] = useState(false);

  useEffect(() => {
    setConfigLocal(config);
  }, [config]);

  useEffect(() => {
    if (!usuario) {
      navigate('/admin');
      return;
    }
    if (isLojista) {
      setAba('relatorios');
    }
  }, [usuario, isLojista, navigate]);

  useEffect(() => {
    async function carregarPedidos() {
      if (aba !== 'relatorios') return;
      const restauranteId = isSuperAdmin ? config?.id : perfil?.restaurante_id;
      if (!restauranteId) return;

      try {
        const data = await listarPedidos({
          restauranteId,
          inicio: periodoInicio ? `${periodoInicio}T00:00:00` : null,
          fim: periodoFim ? `${periodoFim}T23:59:59` : null,
        });
        setPedidos(data);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
      }
    }

    carregarPedidos();
  }, [aba, config, perfil, isSuperAdmin, periodoInicio, periodoFim, listarPedidos]);

  useEffect(() => {
    if (isSuperAdmin) {
      listarRestaurantes().then(setRestaurantes);
    }
  }, [isSuperAdmin, listarRestaurantes]);

  const resumo = useMemo(() => {
    const total = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
    return {
      total,
      quantidade: pedidos.length,
      ticketMedio: pedidos.length ? total / pedidos.length : 0,
    };
  }, [pedidos]);

  if (!usuario) return null;

  const cardapioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#/${config.slug || ''}/cardapio`
    : '/#/cardapio';

  async function handleSalvarProduto(produto) {
    try {
      await salvarProduto(produto);
      setEditando(null);
    } catch (err) {
      alert('Erro ao salvar produto: ' + (err.message || 'Erro desconhecido'));
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este produto?')) return;
    try {
      await excluirProduto(id);
    } catch (err) {
      alert('Erro ao excluir produto: ' + (err.message || 'Erro desconhecido'));
    }
  }

  async function handleAlternar(id) {
    try {
      await alternarAtivo(id);
    } catch (err) {
      alert('Erro ao alterar produto: ' + (err.message || 'Erro desconhecido'));
    }
  }

  async function salvarConfig(e) {
    e.preventDefault();
    setSalvandoConfig(true);
    try {
      await salvarConfiguracoes(configLocal);
      alert('Configurações salvas!');
    } catch (err) {
      alert('Erro ao salvar configurações: ' + (err.message || 'Erro desconhecido'));
    }
    setSalvandoConfig(false);
  }

  async function handleCriarRestaurante(e) {
    e.preventDefault();
    setSalvandoSuper(true);
    try {
      await criarRestaurante(novoRestaurante);
      setNovoRestaurante({ slug: '', nome_comercial: '', whatsapp_contato: '' });
      alert('Loja criada com sucesso!');
    } catch (err) {
      alert('Erro ao criar loja: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSalvandoSuper(false);
    }
  }

  async function handleCriarUsuario(e) {
    e.preventDefault();
    if (!novoUsuario.restaurante_id) {
      alert('Selecione uma loja para o lojista.');
      return;
    }
    setSalvandoSuper(true);
    try {
      await criarUsuarioLojista(novoUsuario);
      setNovoUsuario({ email: '', senha: '', nome: '', restaurante_id: '' });
      alert('Usuário criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar usuário: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSalvandoSuper(false);
    }
  }

  const abas = [
    { id: 'relatorios', label: 'Vendas', icon: BarChart3 },
    ...(isLojista ? [] : [
      { id: 'produtos', label: 'Produtos', icon: Utensils },
      { id: 'config', label: 'Loja', icon: Store },
      { id: 'qrcode', label: 'QR Code', icon: QrCode },
    ]),
    ...(isSuperAdmin ? [
      { id: 'lojas', label: 'Lojas', icon: Home },
      { id: 'usuarios', label: 'Usuários', icon: Users },
    ] : []),
  ];

  return (
    <div className="min-h-[100svh] bg-bg pb-8">
      <header className="bg-dark text-light">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <h1 className="text-lg font-bold flex-1">Painel Admin</h1>
          <span className="text-xs text-gray-400 truncate max-w-[120px]">{config.nome || '—'}</span>
          <button
            onClick={async () => {
              await logoutAdmin();
              navigate('/admin');
            }}
            className="p-2 hover:bg-white/10 rounded-full"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="flex overflow-x-auto p-1 bg-white rounded-xl border border-border gap-1 scrollbar-hide">
          {abas.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAba(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  aba === tab.id ? 'bg-primary text-white' : 'text-muted hover:bg-gray-50'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {aba === 'relatorios' && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-border rounded-xl text-sm"
              />
              <input
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-border text-center">
                <p className="text-xs text-muted">Pedidos</p>
                <p className="text-xl font-bold text-dark">{resumo.quantidade}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-border text-center">
                <p className="text-xs text-muted">Total</p>
                <p className="text-xl font-bold text-primary">{formatarMoeda(resumo.total)}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-border text-center">
                <p className="text-xs text-muted">Ticket</p>
                <p className="text-xl font-bold text-dark">{formatarMoeda(resumo.ticketMedio)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {pedidos.length === 0 ? (
                <p className="p-6 text-center text-muted text-sm">Nenhum pedido no período.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {pedidos.map((p) => (
                    <li key={p.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-dark">{p.cliente_nome}</span>
                        <span className="text-sm font-bold text-primary">{formatarMoeda(p.total)}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">{formatarData(p.created_at)}</p>
                      {p.localizacao_maps && (
                        <a
                          href={p.localizacao_maps}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline mt-1 inline-block"
                        >
                          Ver localização
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {aba === 'produtos' && !isLojista && (
          <div className="mt-4">
            <button
              onClick={() => setEditando('novo')}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Novo produto
            </button>

            {editando === 'novo' && (
              <ProdutoForm
                restauranteId={config.id}
                onSalvar={handleSalvarProduto}
                onCancelar={() => setEditando(null)}
              />
            )}

            <div className="mt-4 space-y-3">
              {produtos.map((p) => (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl p-3 border border-border flex gap-3 ${
                    !p.ativo ? 'opacity-60' : ''
                  }`}
                >
                  <img src={p.imagem} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark truncate">{p.nome}</h3>
                    <p className="text-sm text-primary font-semibold">
                      {formatarMoeda(p.preco)}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {CATEGORIAS.find((c) => c.id === p.categoria)?.nome}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleAlternar(p.id)}
                      className={`p-1.5 rounded-full ${p.ativo ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
                      title={p.ativo ? 'Desativar' : 'Ativar'}
                    >
                      <Power size={16} />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditando(p)}
                        className="px-3 py-1 text-xs font-semibold bg-gray-100 rounded-lg"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(p.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {editando && typeof editando === 'object' && (
                <ProdutoForm
                  restauranteId={config.id}
                  produtoInicial={editando}
                  onSalvar={handleSalvarProduto}
                  onCancelar={() => setEditando(null)}
                />
              )}
            </div>
          </div>
        )}

        {aba === 'config' && !isLojista && (
          <form onSubmit={salvarConfig} className="mt-4 bg-white rounded-2xl p-4 border border-border space-y-4">
            <div>
              <label className="text-sm font-semibold text-dark">Nome do estabelecimento</label>
              <input
                value={configLocal.nome || ''}
                onChange={(e) => setConfigLocal({ ...configLocal, nome: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark">WhatsApp (com DDI e DDD)</label>
              <input
                value={configLocal.telefone || ''}
                onChange={(e) => setConfigLocal({ ...configLocal, telefone: e.target.value })}
                placeholder="5511999999999"
                className="w-full mt-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={salvandoConfig}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Store size={18} /> {salvandoConfig ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </form>
        )}

        {aba === 'qrcode' && !isLojista && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-border text-center">
            <QrCode size={32} className="mx-auto text-primary mb-3" />
            <h2 className="font-bold text-dark mb-1">QR Code do cardápio</h2>
            <p className="text-xs text-muted mb-4 break-all">{cardapioUrl}</p>
            <div className="flex justify-center">
              <QRCodeCanvas value={cardapioUrl} size={220} level="H" />
            </div>
            <p className="text-xs text-muted mt-4">
              Imprima e cole nas mesas para seus clientes acessarem o cardápio.
            </p>
          </div>
        )}

        {aba === 'lojas' && isSuperAdmin && (
          <div className="mt-4 space-y-4">
            <form onSubmit={handleCriarRestaurante} className="bg-white rounded-2xl p-4 border border-border space-y-3">
              <h3 className="font-bold text-dark">Cadastrar nova loja</h3>
              <input
                required
                placeholder="Slug (ex: burguer-do-chef)"
                value={novoRestaurante.slug}
                onChange={(e) => setNovoRestaurante({ ...novoRestaurante, slug: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              <input
                required
                placeholder="Nome comercial"
                value={novoRestaurante.nome_comercial}
                onChange={(e) => setNovoRestaurante({ ...novoRestaurante, nome_comercial: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              <input
                required
                placeholder="WhatsApp (com DDI e DDD)"
                value={novoRestaurante.whatsapp_contato}
                onChange={(e) => setNovoRestaurante({ ...novoRestaurante, whatsapp_contato: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={salvandoSuper}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-70"
              >
                {salvandoSuper ? 'Cadastrando...' : 'Cadastrar loja'}
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {restaurantes.length === 0 ? (
                <p className="p-6 text-center text-muted text-sm">Nenhuma loja cadastrada.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {restaurantes.map((r) => (
                    <li key={r.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-dark text-sm">{r.nome_comercial}</p>
                        <p className="text-xs text-muted">/{r.slug}</p>
                      </div>
                      <button
                        onClick={() => selecionarRestaurante(r)}
                        className="text-xs text-primary font-semibold"
                      >
                        Gerenciar produtos
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {aba === 'usuarios' && isSuperAdmin && (
          <div className="mt-4 space-y-4">
            <form onSubmit={handleCriarUsuario} className="bg-white rounded-2xl p-4 border border-border space-y-3">
              <h3 className="font-bold text-dark">Criar usuário lojista</h3>
              <input
                required
                placeholder="Nome"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              <input
                required
                type="password"
                placeholder="Senha"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              <select
                required
                value={novoUsuario.restaurante_id}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, restaurante_id: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              >
                <option value="">Selecione a loja</option>
                {restaurantes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome_comercial}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={salvandoSuper}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-70"
              >
                {salvandoSuper ? 'Criando...' : 'Criar usuário'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
