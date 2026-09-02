import { useEffect, useState } from 'react';
import { Loader2, Menu, LogOut, BarChart3, Utensils, QrCode, Store, Palette, Building2, Users, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/useApp';
import Sidebar from './components/Sidebar';
import Vendas from './views/Vendas';
import Produtos from './views/Produtos';
import LojaAparencia from './views/LojaAparencia';
import QRCode from './views/QRCode';
import Lojas from './views/Lojas';
import Usuarios from './views/Usuarios';

export default function AdminLayout() {
  const { usuario, perfil, verificandoSessao, isSuperAdmin, logoutAdmin, config, selecionarRestaurante } = useApp();

  const [aba, setAba] = useState(null); // definido após sabermos o papel
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [lojaEmGestao, setLojaEmGestao] = useState(null);
  const [erroTela, setErroTela] = useState('');

  useEffect(() => {
    if (aba !== null) return;
    if (isSuperAdmin) setAba('lojas');
    else if (perfil?.papel === 'lojista') setAba('vendas');
  }, [isSuperAdmin, perfil, aba]);

  useEffect(() => {
    if (!usuario && !verificandoSessao) {
      setErroTela('Sessão encerrada. Redirecionando para o login...');
      const t = setTimeout(() => { window.location.href = '/#/login'; }, 1200);
      return () => clearTimeout(t);
    }
  }, [usuario, verificandoSessao]);

  if (verificandoSessao || !usuario || aba === null) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center bg-dark text-light gap-4 p-6 text-center">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-muted text-sm">{erroTela || 'Carregando painel...'}</p>
      </div>
    );
  }

  async function handleGerenciarLoja(loja) {
    await selecionarRestaurante(loja);
    setLojaEmGestao(loja);
    setAba('vendas');
  }

  function voltarParaLojas() {
    setLojaEmGestao(null);
    setAba('lojas');
  }

  const restauranteIdAtivo = isSuperAdmin ? lojaEmGestao?.id : perfil?.restaurante_id;
  const cardapioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#/${config.slug || ''}`
    : '/';

  const gruposMenu = isSuperAdmin
    ? [
        { titulo: 'Plataforma', itens: [
          { id: 'lojas', label: 'Lojas', icon: Building2 },
          { id: 'usuarios', label: 'Usuários', icon: Users },
        ] },
        ...(lojaEmGestao ? [{ titulo: `Gerenciando: ${lojaEmGestao.nome_comercial}`, itens: [
          { id: 'vendas', label: 'Vendas', icon: BarChart3 },
          { id: 'produtos', label: 'Produtos', icon: Utensils },
          { id: 'loja', label: 'Loja & aparência', icon: Palette },
          { id: 'qrcode', label: 'QR Code', icon: QrCode },
        ] }] : []),
      ]
    : [
        { titulo: 'Gestão', itens: [
          { id: 'vendas', label: 'Vendas', icon: BarChart3 },
          { id: 'produtos', label: 'Produtos', icon: Utensils },
        ] },
        { titulo: 'Loja', itens: [
          { id: 'loja', label: 'Loja & aparência', icon: Store },
          { id: 'qrcode', label: 'QR Code', icon: QrCode },
        ] },
      ];

  function renderConteudo() {
    if (aba === 'lojas') return <Lojas onGerenciarLoja={handleGerenciarLoja} />;
    if (aba === 'usuarios') return <Usuarios />;
    if (aba === 'vendas') return <Vendas restauranteId={restauranteIdAtivo} />;
    if (aba === 'produtos') return <Produtos />;
    if (aba === 'loja') return <LojaAparencia />;
    if (aba === 'qrcode') return <QRCode cardapioUrl={cardapioUrl} />;
    return null;
  }

  const tituloAba = {
    lojas: 'Lojas', usuarios: 'Usuários', vendas: 'Vendas', produtos: 'Produtos',
    loja: 'Loja & aparência', qrcode: 'QR Code',
  }[aba];

  return (
    <div className="min-h-[100svh] bg-bg flex">
      <Sidebar
        grupos={gruposMenu}
        abaAtiva={aba}
        onSelecionar={(id) => { setAba(id); setSidebarAberta(false); }}
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
        nomeLoja={isSuperAdmin ? 'Painel da plataforma' : config.nome}
        papel={perfil?.papel}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-border flex items-center gap-3 px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarAberta(true)} className="p-2 -ml-2 text-dark lg:hidden">
            <Menu size={22} />
          </button>

          {isSuperAdmin && lojaEmGestao && (
            <button
              onClick={voltarParaLojas}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-dark mr-1"
            >
              <ArrowLeft size={16} /> Lojas
            </button>
          )}

          <h1 className="text-lg font-bold text-dark flex-1 truncate">{tituloAba}</h1>

          <button
            onClick={async () => { await logoutAdmin(); window.location.href = '/#/login'; }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-dark hover:bg-bg rounded-lg"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderConteudo()}
          </div>
        </main>
      </div>
    </div>
  );
}
