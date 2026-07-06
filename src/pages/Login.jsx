import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/useApp';

export default function Login() {
  const navigate = useNavigate();
  const { loginAdmin, verificandoSessao, perfil, usuario } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (usuario && perfil?.papel) {
      navigate('/admin');
    }
  }, [usuario, perfil, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha email e senha.');
      return;
    }

    setCarregando(true);
    const res = await loginAdmin(email, senha);
    setCarregando(false);

    if (!res.sucesso) {
      setErro(res.error?.message || 'Erro ao entrar.');
      return;
    }
  };

  if (verificandoSessao) {
    return (
      <div className="min-h-screen bg-dark text-light flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-dark shadow-lg">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Store size={32} className="text-light" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider">Acesso restrito</p>
            <h1 className="text-2xl font-bold">Painel do Lojista</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {carregando && <Loader2 size={20} className="animate-spin" />}
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
