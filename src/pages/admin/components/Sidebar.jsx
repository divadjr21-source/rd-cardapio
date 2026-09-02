import { X } from 'lucide-react';

export default function Sidebar({ grupos, abaAtiva, onSelecionar, aberta, onFechar, nomeLoja, papel }) {
  return (
    <>
      {/* Overlay mobile */}
      {aberta && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onFechar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark text-white z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          aberta ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] text-white/40 leading-none">Painel de gestão</p>
            <p className="font-bold text-sm truncate mt-1">{nomeLoja || 'Cardápio Digital'}</p>
          </div>
          <button onClick={onFechar} className="p-1 text-white/60 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {grupos.map((grupo) => (
            <div key={grupo.titulo}>
              <p className="px-3 text-[10px] text-white/35 font-semibold mb-1.5">{grupo.titulo}</p>
              <div className="space-y-0.5">
                {grupo.itens.map((item) => {
                  const Icon = item.icon;
                  const ativo = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelecionar(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        ativo
                          ? 'bg-primary text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={17} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40 shrink-0">
          Conectado como {papel === 'super_admin' ? 'administrador da plataforma' : 'lojista'}
        </div>
      </aside>
    </>
  );
}
