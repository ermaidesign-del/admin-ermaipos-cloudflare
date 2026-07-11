import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { RefreshCw, Key } from 'lucide-react';
import LicenseCard from '../components/LicenseCard';

export default function GenerateLicensePage() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('clientId');

  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState(preselectedId || '');
  const [months, setMonths] = useState(12);
  const [maxActivations, setMaxActivations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.clients.list().then((data) => {
      setClients(data);
      if (!preselectedId && data.length > 0) setClientId(data[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!clientId) return;
    setGenerating(true);
    setError('');
    setResult(null);
    try {
      setResult(await api.licenses.generate(clientId, months, maxActivations));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><RefreshCw className="animate-spin text-primary" size={24} /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-foreground">Generar Licencia</h1>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Cliente</label>
            {clients.length === 0 ? (
              <p className="text-sm text-warning">No hay clientes registrados. <Link to="/clients/new" className="text-primary hover:text-primary-hover">Crear cliente</Link></p>
            ) : (
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Duración: {months} {months === 1 ? 'mes' : 'meses'}</label>
            <input type="range" min={1} max={60} value={months} onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>1 mes</span>
              <span>60 meses</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Máquinas permitidas</label>
            <div className="flex gap-2 items-center">
              <select value={maxActivations} onChange={(e) => setMaxActivations(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
                <option value={0}>Ilimitado</option>
                <option value={1}>1 máquina</option>
                <option value={2}>2 máquinas</option>
                <option value={3}>3 máquinas</option>
                <option value={5}>5 máquinas</option>
                <option value={10}>10 máquinas</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || !clientId || clients.length === 0}
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
            <Key size={16} /> {generating ? 'Generando...' : 'Generar Serial'}
          </button>

          {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-2 text-sm">{error}</div>}
        </div>

        {result && (
          <LicenseCard
            serial={result.serial}
            clientName={result.client_name}
            expiresAt={result.expires_at}
            months={result.months_duration}
          />
        )}
      </div>
    </div>
  );
}
