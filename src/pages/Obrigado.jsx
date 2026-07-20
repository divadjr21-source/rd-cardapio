import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';

export default function Obrigado() {
  const navigate = useNavigate();
  const slug = useRestauranteSlug();

  return (
    <div
      className="min-h-[100svh] flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}
    >
      <CheckCircle
        size={72}
        className="mb-4"
        style={{ color: 'var(--primary-color, #22c55e)' }}
      />
      <h1 className="text-2xl font-bold text-dark">Pedido enviado!</h1>
      <p className="text-muted mt-2 max-w-xs">
        Em breve nossa equipe entrará em contato pelo WhatsApp para confirmar seu pedido.
      </p>
      <button
        onClick={() => navigate(`/${slug}`)}
        className="mt-8 px-8 py-3 text-white rounded-full font-bold flex items-center gap-2"
        style={{ backgroundColor: 'var(--primary-color, #ef4444)' }}
      >
        <Home size={18} />
        Voltar ao início
      </button>
    </div>
  );
}
