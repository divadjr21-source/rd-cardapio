import { useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
import { useApp } from '../../../context/useApp';
import AppearancePanel from '../../../components/AppearancePanel';

export default function LojaAparencia() {
  const { config, salvarConfiguracoes } = useApp();
  const [configLocal, setConfigLocal] = useState(config);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => setConfigLocal(config), [config]);

  async function salvarDadosLoja(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await salvarConfiguracoes(configLocal);
      setMensagem('Dados da loja salvos com sucesso.');
    } catch (err) {
      setMensagem('Erro ao salvar: ' + (err.message || 'tente novamente.'));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarAparencia() {
    setSalvando(true);
    setMensagem('');
    try {
      await salvarConfiguracoes(configLocal);
      setMensagem('Aparência salva com sucesso.');
    } catch (err) {
      setMensagem('Erro ao salvar: ' + (err.message || 'tente novamente.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-5">
          <Store className="text-primary" size={20} />
          <h2 className="font-bold text-dark">Dados da loja</h2>
        </div>

        <form onSubmit={salvarDadosLoja} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nome comercial</label>
            <input
              type="text"
              value={configLocal.nome || ''}
              onChange={(e) => setConfigLocal({ ...configLocal, nome: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">WhatsApp para pedidos</label>
            <input
              type="text"
              value={configLocal.telefone || ''}
              onChange={(e) => setConfigLocal({ ...configLocal, telefone: e.target.value })}
              placeholder="55DDDNÚMERO"
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Endereço</label>
            <input
              type="text"
              value={configLocal.endereco || ''}
              onChange={(e) => setConfigLocal({ ...configLocal, endereco: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">URL do logo</label>
            <input
              type="text"
              value={configLocal.logo || ''}
              onChange={(e) => setConfigLocal({ ...configLocal, logo: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={configLocal.modulo_delivery !== false}
                onChange={(e) => setConfigLocal({ ...configLocal, modulo_delivery: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              Delivery ativo
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={configLocal.modulo_mesa === true}
                onChange={(e) => setConfigLocal({ ...configLocal, modulo_mesa: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              Pedido por mesa ativo
            </label>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar dados da loja'}
          </button>

          {mensagem && <p className="text-xs text-muted text-center">{mensagem}</p>}
        </form>
      </div>

      <AppearancePanel
        config={configLocal}
        onChange={setConfigLocal}
        onSalvar={salvarAparencia}
      />
    </div>
  );
}
