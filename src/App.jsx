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
      const { data, error } = await supabase
        .from('restaurantes')
        .select('slug')
        .eq('status', 'ativo')
        .order('created_at')
        .limit(1)
        .single();

      if (ignorar) return;

      if (error || !data) {
        setErro('Nenhum restaurante encontrado.');
        return;
      }

      navigate(`/${data.slug}/cardapio`, { replace: true });
    }

    buscarRestaurante();

    return () => {
      ignorar = true;
    };
  }, [navigate]);

  if (erro) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-dark text-red-400 px-6 text-center">
        {erro}
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
