import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

export default function Obrigado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100svh] bg-bg flex flex-col items-center justify-center px-6 text-center">
      <CheckCircle size={72} className="text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-dark">Pedido enviado!</h1>
      <p className="text-muted mt-2 max-w-xs">
        Em breve nossa equipe entrará em contato pelo WhatsApp para confirmar seu pedido.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold flex items-center gap-2"
      >
        <Home size={18} />
        Voltar ao início
      </button>
    </div>
  );
}
