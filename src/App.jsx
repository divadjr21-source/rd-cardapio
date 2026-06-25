import { Routes, Route, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
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
      <Link
        to="/admin"
        className="fixed top-4 right-4 z-50 p-2.5 bg-white/90 backdrop-blur text-dark rounded-full shadow hover:scale-105 transition-transform"
        title="Painel Admin"
      >
        <Settings size={20} />
      </Link>
    </div>
  );
}
