import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LicenseCardProps {
  serial: string;
  clientName: string;
  expiresAt: string;
  months: number;
}

export default function LicenseCard({ serial, clientName, expiresAt, months }: LicenseCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(serial);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 max-w-md">
      <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Licencia Generada</div>
      <div className="text-lg font-bold text-primary mb-4">{clientName}</div>
      <div className="bg-background rounded-lg p-4 mb-4 text-center">
        <code className="text-sm font-mono text-foreground tracking-wider select-all">{serial}</code>
      </div>
      <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
        <span>{months} {months === 1 ? 'mes' : 'meses'}</span>
        <span>Expira: {new Date(expiresAt).toLocaleDateString('es-AR')}</span>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copiado' : 'Copiar Serial'}
      </button>
    </div>
  );
}
