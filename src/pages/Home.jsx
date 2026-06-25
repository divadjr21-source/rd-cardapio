import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { Store } from 'lucide-react';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';

export default function Home() {
  const navigate = useNavigate();
  const { config, carregando, erro } = useApp();
  const slug = useRestauranteSlug();

  if (carregando) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-dark text-light">
        <p className="text-muted">Carregando...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center bg-dark text-light px-6 text-center">
        <p className="text-red-400">{erro}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-dark text-light px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
        {config.logo ? (
          <img
            src={config.logo}
            alt={config.nome}
            className="w-32 h-32 object-cover rounded-full border-4 border-primary shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
            <Store size={48} className="text-light" />
          </div>
        )}

        <div>
          <p className="text-sm uppercase tracking-widest text-red-300 mb-2">Bem-vindo ao</p>
          <h1 className="text-3xl font-bold">{config.nome}</h1>
          {config.endereco && (
            <p className="mt-2 text-sm text-gray-300">{config.endereco}</p>
          )}
        </div>

        <button
          onClick={() => navigate(`/${slug}/cardapio`)}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Ver Cardápio
        </button>
      </div>
    </div>
  );
}
