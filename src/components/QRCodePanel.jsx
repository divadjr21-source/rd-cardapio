import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodePanel({ cardapioUrl }) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    setMostrar(true);
  }, []);

  return (
    <div className="mt-6 bg-white rounded-2xl p-6 border border-border text-center">
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
      <p className="text-xs text-muted mt-4">
        Imprima e cole nas mesas para seus clientes acessarem o cardápio.
      </p>
    </div>
  );
}
