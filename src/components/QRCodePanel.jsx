import { useEffect, useState, useRef } from 'react';
import { QrCode, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodePanel({ cardapioUrl }) {
  const [mostrar, setMostrar] = useState(false);
  const [quantidadeMesas, setQuantidadeMesas] = useState(1);
  const [mesasGeradas, setMesasGeradas] = useState(0);
  const printRef = useRef(null);

  useEffect(() => {
    setMostrar(true);
  }, []);

  const gerarMesas = () => {
    const qtd = Math.max(1, Math.min(500, Number(quantidadeMesas) || 0));
    setQuantidadeMesas(qtd);
    setMesasGeradas(qtd);
  };

  const urlParaMesa = (numero) => `${cardapioUrl}?mesa=${numero}`;

  const handleImprimir = () => {
    if (!mesasGeradas) return;
    window.print();
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-2xl p-6 border border-border text-center no-print">
        <QrCode size={32} className="mx-auto text-primary mb-3" />
        <h2 className="font-bold text-dark mb-1">QR Code do cardápio</h2>
        <p className="text-xs text-muted mb-4 break-all">{cardapioUrl}</p>
        <div className="flex justify-center min-h-[220px] items-center">
          {mostrar ? (
            <QRCodeCanvas value={cardapioUrl} size={220} level="H" />
          ) : (
            <div className="w-[220px] h-[220px] bg-gray-100 rounded-lg skeleton" />
          )}
        </div>
      </div>

      <div className="mt-5 bg-white rounded-2xl p-6 border border-border no-print">
        <h3 className="font-bold text-dark mb-3">QR Codes por mesa</h3>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Quantidade de mesas</label>
            <input
              type="number"
              min={1}
              max={500}
              value={quantidadeMesas}
              onChange={(e) => setQuantidadeMesas(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={gerarMesas}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-transform active:scale-95"
          >
            Gerar QR Codes
          </button>
        </div>

        {mesasGeradas > 0 && (
          <button
            onClick={handleImprimir}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-dark hover:bg-black text-white font-semibold rounded-xl transition-transform active:scale-95"
          >
            <Printer size={18} /> Imprimir folha de mesas
          </button>
        )}
      </div>

      {mesasGeradas > 0 && (
        <div
          ref={printRef}
          className="print-only mt-6 bg-white p-8"
        >
          <div className="text-center mb-6 no-screen">
            <h1 className="text-2xl font-bold">Cardápio Digital - Mesas</h1>
            <p className="text-sm text-gray-500">{cardapioUrl}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: mesasGeradas }, (_, i) => i + 1).map((numero) => (
              <div
                key={numero}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl break-inside-avoid"
              >
                <QRCodeCanvas value={urlParaMesa(numero)} size={150} level="H" />
                <p className="mt-2 text-xl font-bold text-dark">Mesa {numero}</p>
                <p className="text-[10px] text-gray-400 text-center break-all">
                  {urlParaMesa(numero)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only,
          .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .no-screen {
            display: block !important;
          }
        }
        .no-screen {
          display: none;
        }
      `}</style>
    </div>
  );
}
