import { Routes, Route, useParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Home from './pages/Home.jsx';
import Cardapio from './pages/Cardapio.jsx';
import Carrinho from './pages/Carrinho.jsx';
import Checkout from './pages/Checkout.jsx';
import Obrigado from './pages/Obrigado.jsx';
import Admin from './pages/Admin.jsx';

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

export default function App() {
  return (
    <div className="relative flex-1">
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/:slug/*" element={<RestauranteLayout />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}
