import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setLicenses(await api.licenses.list());
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta licencia?')) return;
    try {
      await api.licenses.delete(id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Licencias</h1>
        <Link
          to="/licenses/generate"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Generar Licencia
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="animate-spin text-primary" size={24} />
        </div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p>No hay licencias generadas</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Serial</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Emisión</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Expira</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Días Rest.</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Activaciones</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-text-secondary font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => {
                const info = lic.info || {};
                const expired = info.isExpired;
                const expiring = !expired && (info.daysRemaining || 0) <= 30;

                return (
                  <tr key={lic.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{lic.serial}</td>
                    <td className="px-4 py-3 text-foreground">{lic.client_name || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(lic.issued_at).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(lic.expires_at).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${expired ? 'text-destructive' : expiring ? 'text-warning' : 'text-success'}`}>
                        {info.daysRemaining != null ? (expired ? 'Vencida' : `${info.daysRemaining} días`) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {lic.activations?.length || 0}{lic.max_activations > 0 ? `/${lic.max_activations}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        expired ? 'bg-destructive/10 text-destructive' :
                        expiring ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                        {expired ? 'Vencida' : expiring ? 'Por vencer' : 'Activa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(lic.id)}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-destructive transition-colors" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
