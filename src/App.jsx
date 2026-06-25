import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppProvider } from './context/AppContext.jsx';
import Home from './pages/Home.jsx';
import Cardapio from './pages/Cardapio.jsx';
import Carrinho from './pages/Carrinho.jsx';
import Checkout from './pages/Checkout.jsx';
import Obrigado from './pages/Obrigado.jsx';
import Admin from './pages/Admin.jsx';
import { supabase } from './lib/supabase.js';

function RestauranteLayout() {
  const { slug } = useParams();
  return (
    <AppProvider restauranteSlug={slug}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="cardapio" element={<Cardapio />} />
        <Route path="carrinho" element={<Carrinho />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="obrigado" element={<Obrigado />} />
      </Routes>
    </AppProvider>
  );
}

function RedirectToPrimeiroRestaurante() {
  const navigate = useNavigate();
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ignorar = false;

    async function buscarRestaurante() {
      try {
        const { data, error } = await supabase
          .from('restaurantes')
          .select('slug')
          .eq('status', 'ativo')
          .order('created_at')
          .limit(1)
          .single();

        if (ignorar) return;

        if (error || !data) {
          setErro(error?.message || 'Nenhum restaurante encontrado.');
          return;
        }

        navigate(`/${data.slug}/cardapio`, { replace: true });
      } catch (err) {
        if (!ignorar) setErro(err.message || 'Erro inesperado ao buscar restaurante.');
      }
    }

    buscarRestaurante();

    return () => {
      ignorar = true;
    };
  }, [navigate]);

  if (erro) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center bg-dark text-red-400 px-6 text-center gap-4">
        <p>{erro}</p>
        <p className="text-sm text-gray-400">Verifique se as variáveis de ambiente do Supabase estão configuradas na Vercel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-dark text-light gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-muted">Buscando restaurante...</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative flex-1">
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/:slug/*" element={<RestauranteLayout />} />
        <Route path="/" element={<RedirectToPrimeiroRestaurante />} />
      </Routes>
    </div>
  );
}
