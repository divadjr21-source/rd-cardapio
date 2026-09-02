import QRCodePanel from '../../../components/QRCodePanel';

export default function QRCode({ cardapioUrl }) {
  return (
    <div className="max-w-xl">
      <QRCodePanel cardapioUrl={cardapioUrl} />
    </div>
  );
}
