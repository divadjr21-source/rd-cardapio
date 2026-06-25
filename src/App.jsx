import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Cardapio from './pages/Cardapio.jsx';
import Carrinho from './pages/Carrinho.jsx';
import Checkout from './pages/Checkout.jsx';
import Obrigado from './pages/Obrigado.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <div className="relative flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/obrigado" element={<Obrigado />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
