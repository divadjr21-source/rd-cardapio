import { useEffect, useState } from 'react';
import { Palette, Save, Smartphone } from 'lucide-react';
import { ESTABELECIMENTO } from '../data/constants';

export default function AppearancePanel({ config, onChange, onSalvar }) {
  const [estilo, setEstilo] = useState(config?.estilo_config || ESTABELECIMENTO.estilo_config);

  useEffect(() => {
    setEstilo(config?.estilo_config || ESTABELECIMENTO.estilo_config);
  }, [config?.estilo_config]);

  function atualizarCampo(campo, valor) {
    const novo = { ...estilo, [campo]: valor };
    setEstilo(novo);
    onChange?.({
      ...config,
      estilo_config: novo,
    });
  }

  const previewEstilo = {
    '--preview-primary': estilo.cor_primaria,
    '--preview-bg': estilo.cor_fundo,
    '--preview-radius': estilo.estilo_bordas === 'quadrado' ? '0.5rem' : '1rem',
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="text-primary" size={22} />
          <h2 className="font-bold text-dark">Aparência do cardápio</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-dark">Cor primária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={estilo.cor_primaria}
                onChange={(e) => atualizarCampo('cor_primaria', e.target.value)}
                className="w-10 h-10 p-0 border-0 rounded-lg overflow-hidden cursor-pointer"
              />
              <span className="text-xs text-muted font-mono w-16 text-right">{estilo.cor_primaria}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-dark">Cor de fundo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={estilo.cor_fundo}
                onChange={(e) => atualizarCampo('cor_fundo', e.target.value)}
                className="w-10 h-10 p-0 border-0 rounded-lg overflow-hidden cursor-pointer"
              />
              <span className="text-xs text-muted font-mono w-16 text-right">{estilo.cor_fundo}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-dark">Estilo das bordas</label>
            <select
              value={estilo.estilo_bordas}
              onChange={(e) => atualizarCampo('estilo_bordas', e.target.value)}
              className="px-3 py-2 bg-bg border border-border rounded-xl text-sm"
            >
              <option value="arredondado">Arredondado</option>
              <option value="quadrado">Quadrado</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onSalvar}
          className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Save size={18} /> Salvar aparência
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="text-primary" size={22} />
          <h3 className="font-bold text-dark">Pré-visualização</h3>
        </div>

        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: estilo.cor_fundo,
            borderRadius: previewEstilo['--preview-radius'],
            borderColor: estilo.cor_primaria,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: estilo.cor_primaria }}
            />
            <div>
              <p className="font-bold text-white text-sm">Sua Loja</p>
              <p className="text-xs text-white/70">Cardápio digital</p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 mb-3"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: previewEstilo['--preview-radius'],
            }}
          >
            <p className="text-white text-sm">X-Burguer</p>
            <p className="text-white/70 text-xs">Hambúrguer artesanal</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-white font-bold text-sm">R$ 25,00</span>
              <button
                className="px-3 py-1.5 text-xs font-bold text-white rounded-lg"
                style={{ backgroundColor: estilo.cor_primaria }}
              >
                Adicionar
              </button>
            </div>
          </div>

          <button
            className="w-full py-3 font-bold text-white rounded-xl"
            style={{
              backgroundColor: estilo.cor_primaria,
              borderRadius: previewEstilo['--preview-radius'],
            }}
          >
            Ver pedido
          </button>
        </div>
      </div>
    </div>
  );
}
