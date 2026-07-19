import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { Store, ChevronRight } from 'lucide-react';
import { useRestauranteSlug } from '../hooks/useRestauranteSlug';

function SkeletonPulse({ className }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export default function Home() {
  const navigate = useNavigate();
  const { config, carregando, erro } = useApp();
  const slug = useRestauranteSlug();

  if (carregando) {
    return (
      <div className="min-h-[100svh] relative flex flex-col items-center justify-center overflow-hidden text-light px-6"
        style={{ backgroundColor: 'var(--bg-color, #0f172a)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/60 to-[var(--primary-color,#ef4444)]/20 opacity-80" />
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 animate-fade-up">
          <div className="w-36 h-36 rounded-full skeleton bg-white/5 border-4 border-white/10" />
          <SkeletonPulse className="h-5 w-32 bg-white/10" />
          <SkeletonPulse className="h-10 w-48 bg-white/10" />
          <SkeletonPulse className="h-12 w-full bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center text-light px-6 text-center"
        style={{ backgroundColor: 'var(--bg-color, #0f172a)' }}>
        <p className="text-red-400">{erro}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100svh] relative flex flex-col items-center justify-center overflow-hidden text-light px-6 py-12"
      style={{ backgroundColor: 'var(--bg-color, #0f172a)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/60 to-[var(--primary-color,#ef4444)]/25 opacity-80" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        <div className="animate-fade-up relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
          {config.logo ? (
            <img
              src={config.logo}
              alt={config.nome}
              className="relative w-36 h-36 object-cover rounded-full border-[3px] border-white/90 shadow-2xl"
            />
          ) : (
            <div className="relative w-36 h-36 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
              <Store size={56} className="text-light" />
            </div>
          )}
        </div>

        <div className="mt-8 animate-fade-up animate-delay-100">
          <p className="text-sm font-medium uppercase tracking-[0.2em] mb-2"
            style={{ color: 'var(--primary-color, #ef4444)' }}
          >
            Bem-vindo ao
          </p>
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            {config.nome || '...'}
          </h1>
          {config.endereco && (
            <p className="mt-3 text-sm text-gray-300 leading-relaxed px-4">
              {config.endereco}
            </p>
          )}
        </div>

        <div className="mt-10 w-full animate-fade-up animate-delay-200">
          <button
            onClick={() => navigate(`/${slug}/cardapio`)}
            className="group w-full py-4 text-dark font-bold rounded-2xl shadow-[0_10px_40px_-12px_rgba(255,255,255,0.3)] transition-all duration-300 hover:shadow-[0_14px_48px_-10px_rgba(255,255,255,0.4)] active:scale-[0.97] flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary-color, #ef4444)', color: '#fff' }}
          >
            Ver Cardápio
            <ChevronRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
