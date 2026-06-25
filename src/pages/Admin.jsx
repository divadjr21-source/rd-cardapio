import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, Power, QrCode, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIAS } from '../data/constants';
import { QRCodeCanvas } from 'qrcode.react';

function ProdutoForm({ produtoInicial, onSalvar, onCancelar }) {
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
        <img
          src={produto.imagem}
          alt="Preview"
          className="h-24 w-full object-cover rounded-lg"
        />
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
  const { config, setConfig, produtos, salvarProduto, excluirProduto, alternarAtivo } = useApp();
  const [editando, setEditando] = useState(null);
  const [aba, setAba] = useState('produtos');
  const [configLocal, setConfigLocal] = useState(config);

  const cardapioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/cardapio`
    : '/cardapio';

  const salvarConfig = (e) => {
    e.preventDefault();
    setConfig(configLocal);
    alert('Configurações salvas!');
  };

  return (
    <div className="min-h-[100svh] bg-bg pb-8">
      <header className="bg-dark text-light">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold">Painel Admin</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="flex p-1 bg-white rounded-xl border border-border">
          {[
            { id: 'produtos', label: 'Produtos' },
            { id: 'config', label: 'Loja' },
            { id: 'qrcode', label: 'QR Code' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                aba === tab.id ? 'bg-primary text-white' : 'text-muted hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {aba === 'produtos' && (
          <div className="mt-4">
            <button
              onClick={() => setEditando('novo')}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Novo produto
            </button>

            {editando === 'novo' && (
              <ProdutoForm
                onSalvar={(p) => {
                  salvarProduto(p);
                  setEditando(null);
                }}
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
                      R$ {p.preco.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {CATEGORIAS.find((c) => c.id === p.categoria)?.nome}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => alternarAtivo(p.id)}
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
                        onClick={() => {
                          if (confirm('Excluir este produto?')) excluirProduto(p.id);
                        }}
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
                  produtoInicial={editando}
                  onSalvar={(p) => {
                    salvarProduto(p);
                    setEditando(null);
                  }}
                  onCancelar={() => setEditando(null)}
                />
              )}
            </div>
          </div>
        )}

        {aba === 'config' && (
          <form onSubmit={salvarConfig} className="mt-4 bg-white rounded-2xl p-4 border border-border space-y-4">
            <div>
              <label className="text-sm font-semibold text-dark">Nome do estabelecimento</label>
              <input
                value={configLocal.nome}
                onChange={(e) => setConfigLocal({ ...configLocal, nome: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark">WhatsApp (com DDI e DDD)</label>
              <input
                value={configLocal.telefone}
                onChange={(e) => setConfigLocal({ ...configLocal, telefone: e.target.value })}
                placeholder="5511999999999"
                className="w-full mt-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark">Endereço</label>
              <input
                value={configLocal.endereco}
                onChange={(e) => setConfigLocal({ ...configLocal, endereco: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark">Logo (URL)</label>
              <input
                value={configLocal.logo}
                onChange={(e) => setConfigLocal({ ...configLocal, logo: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm"
              />
              {configLocal.logo && (
                <img src={configLocal.logo} alt="Logo" className="mt-2 h-16 w-16 object-cover rounded-full" />
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Store size={18} /> Salvar configurações
            </button>
          </form>
        )}

        {aba === 'qrcode' && (
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
      </div>
    </div>
  );
}
