import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, Phone, MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/useApp';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';
import { useMesaParam } from '../hooks/useMesaParam';

export default function Checkout() {
  const navigate = useNavigate();
  const slug = useRestauranteSlug();
  const { carrinho, total, observacoes, enviarPedido, config } = useApp();
  const numeroMesa = useMesaParam();

  const somenteMesa = config?.modulo_mesa === true && config?.modulo_delivery === false;
  const modoMesaAtivo = config?.modulo_mesa === true && numeroMesa;

  const [cliente, setCliente] = useState({ nome: '', telefone: '', endereco: '' });
  const [erro, setErro] = useState('');
  const [localizacao, setLocalizacao] = useState(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  useEffect(() => {
    if (modoMesaAtivo) {
      setLocalizacao(null);
      setCliente((prev) => ({ ...prev, endereco: '' }));
    }
  }, [modoMesaAtivo]);

  if (carrinho.length === 0) {
    return (
      <div className="min-h-[100svh] bg-bg flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted">Seu carrinho está vazio.</p>
        <button
          onClick={() => navigate(`/${slug}/cardapio`)}
          className="mt-4 px-6 py-3 bg-primary text-white rounded-full font-semibold"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente.nome.trim() || !cliente.telefone.trim()) {
      setErro('Preencha seu nome e telefone.');
      return;
    }

    if (somenteMesa && !numeroMesa) {
      setErro('Por favor, escaneie o QR Code da sua mesa para fazer o pedido.');
      return;
    }

    if (!modoMesaAtivo && config?.modulo_delivery === true && !cliente.endereco?.trim()) {
      // Opcional: exigir endereço apenas se delivery estiver ativo e for delivery
      // setErro('Preencha o endereço de entrega.'); return;
    }

    setErro('');
    try {
      await enviarPedido(
        { ...cliente, observacoes },
        localizacao,
        modoMesaAtivo ? numeroMesa : null
      );
      navigate(`/${slug}/obrigado`);
    } catch (err) {
      setErro(err.message || 'Erro ao enviar pedido. Tente novamente.');
    }
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      setErro('Geolocalização não é suportada pelo navegador.');
      return;
    }

    setBuscandoLocal(true);
    setErro('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocalizacao(coords);
        setBuscandoLocal(false);
      },
      (err) => {
        setBuscandoLocal(false);
        setErro('Não foi possível obter sua localização. Verifique as permissões. ' + (err?.message || ''));
      }
    );
  };

  return (
    <div className="min-h-[100svh] bg-bg pb-32">
      <header className="bg-dark text-light">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(`/${slug}/carrinho`)} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold">Finalizar pedido</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-4">
        {somenteMesa && !numeroMesa && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
              📷
            </div>
            <h2 className="text-lg font-bold text-amber-800 mb-2">
              Escaneie o QR Code da mesa
            </h2>
            <p className="text-sm text-amber-700 leading-relaxed">
              Este cardápio funciona apenas no salão. Aponte a câmera do celular para o QR Code
              fixado na mesa para liberar o pedido.
            </p>
          </div>
        )}

        {(somenteMesa ? numeroMesa : true) && (
          <>
            {modoMesaAtivo && (
              <div className="mb-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold">📌 Atendimento Local</p>
                <p className="text-2xl font-bold">Mesa {numeroMesa}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-border space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    <User size={14} className="inline mr-1" /> Nome
                  </label>
                  <input
                    type="text"
                    value={cliente.nome}
                    onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    <Phone size={14} className="inline mr-1" /> Telefone
                  </label>
                  <input
                    type="tel"
                    value={cliente.telefone}
                    onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {!modoMesaAtivo && (
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-1.5">
                      <MapPin size={14} className="inline mr-1" /> Endereço (opcional)
                    </label>
                    <input
                      type="text"
                      value={cliente.endereco}
                      onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                      placeholder="Rua, número, bairro"
                      className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={capturarLocalizacao}
                      disabled={buscandoLocal}
                      className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark disabled:text-gray-400"
                    >
                      <Navigation size={16} />
                      {buscandoLocal ? 'Obtendo localização...' : localizacao ? 'Localização capturada' : 'Usar minha localização atual'}
                    </button>

                    {localizacao && (
                      <p className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        Coordenadas: {localizacao.lat.toFixed(6)}, {localizacao.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-border">
                <h2 className="font-bold text-dark mb-2">Resumo</h2>
                <ul className="text-sm text-muted space-y-1">
                  {carrinho.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.quantidade}x {item.nome}
                      </span>
                      <span className="text-dark font-medium">
                        R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                    </li>
                  ))}
                </ul>
                {observacoes && (
                  <p className="mt-3 text-xs text-muted bg-bg p-2 rounded-lg">
                    Obs: {observacoes}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-muted">Total</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {erro && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Send size={20} />
                {modoMesaAtivo ? 'Enviar pedido para a cozinha' : 'Enviar pedido pelo WhatsApp'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
