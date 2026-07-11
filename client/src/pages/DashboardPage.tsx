import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Users, Key, AlertTriangle, Ban, RefreshCw } from 'lucide-react';

interface DashboardData {
  totalClients: number; totalLicenses: number; activeLicenses: number;
  expiringSoon: number; expired: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.dashboard());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <RefreshCw className="animate-spin text-primary" size={24} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <p className="text-destructive">{error}</p>
      <button onClick={load} className="text-primary hover:text-primary-hover text-sm">Reintentar</button>
    </div>
  );

  if (!data) return null;

  const cards = [
    { label: 'Total Clientes', value: data.totalClients, icon: Users, color: 'text-primary' },
    { label: 'Licencias Activas', value: data.activeLicenses, icon: Key, color: 'text-success' },
    { label: 'Por Vencer (30 días)', value: data.expiringSoon, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Vencidas', value: data.expired, icon: Ban, color: 'text-destructive' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">{card.label}</span>
              <card.icon size={20} className={card.color} />
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-2">Resumen</h2>
        <p className="text-sm text-text-secondary">
          {data.activeLicenses} de {data.totalLicenses} licencias están activas. {data.expiringSoon} expirarán en los próximos 30 días.
        </p>
      </div>
    </div>
  );
}
