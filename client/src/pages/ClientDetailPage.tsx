import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { RefreshCw, ArrowLeft, Plus, Key, Trash2 } from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setClient(await api.clients.get(id!));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDeleteLicense = async (licenseId: string) => {
    if (!confirm('¿Eliminar esta licencia?')) return;
    try {
      await api.licenses.delete(licenseId);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><RefreshCw className="animate-spin text-primary" size={24} /></div>;
  if (error) return <div className="text-destructive text-center py-16">{error}</div>;
  if (!client) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/clients')} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
          <p className="text-sm text-text-secondary">{client.email || client.phone || 'Sin contacto'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/clients/${id}/edit`} className="text-sm text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors">
            Editar
          </Link>
          <Link
            to={`/licenses/generate?clientId=${id}`}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Generar Licencia
          </Link>
        </div>
      </div>

      {client.notes && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <p className="text-sm text-text-secondary">{client.notes}</p>
        </div>
      )}

      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Key size={16} /> Licencias ({client.licenses?.length || 0})
      </h2>

      {(!client.licenses || client.licenses.length === 0) ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <Key size={32} className="mx-auto mb-2 text-text-secondary opacity-30" />
          <p className="text-text-secondary text-sm">Sin licencias asignadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {client.licenses.map((lic: any) => {
            const expired = new Date(lic.expires_at) < new Date();
            const expiring = !expired && new Date(lic.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const acts = lic.activations || [];
            return (
              <div key={lic.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono text-foreground">{lic.serial}</code>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      expired ? 'bg-destructive/10 text-destructive' :
                      expiring ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {expired ? 'Vencida' : expiring ? 'Por vencer' : 'Activa'}
                    </span>
                    <button onClick={() => handleDeleteLicense(lic.id)}
                      className="p-1 rounded text-text-secondary hover:text-destructive transition-colors" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-text-secondary">
                  <span>Emisión: {new Date(lic.issued_at).toLocaleDateString('es-AR')}</span>
                  <span>Expira: {new Date(lic.expires_at).toLocaleDateString('es-AR')}</span>
                  <span>{lic.months_duration} meses</span>
                  <span>Activaciones: {acts.length}{lic.max_activations > 0 ? `/${lic.max_activations}` : ' ∞'}</span>
                </div>
                {acts.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-text-secondary mb-1">Máquinas activadas:</p>
                    {acts.map((a: any) => (
                      <div key={a.id} className="text-xs text-text-secondary flex items-center gap-2 py-0.5">
                        <span className="w-2 h-2 rounded-full bg-success inline-block" />
                        {a.machineName || 'PC sin nombre'}
                        <span className="opacity-50">({a.hardwareId?.slice(0, 12)}...)</span>
                        <span className="opacity-50">
                          {new Date(a.activated_at).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
