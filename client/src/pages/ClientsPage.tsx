import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Plus, Search, Edit2, Trash2, RefreshCw, ExternalLink } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      setClients(await api.clients.list());
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar cliente "${name}"? También se eliminarán sus licencias.`)) return;
    try {
      await api.clients.delete(id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Clientes</h1>
        <Link
          to="/clients/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Cliente
        </Link>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar clientes..."
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="animate-spin text-primary" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <UsersIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>{search ? 'Sin resultados' : 'No hay clientes registrados'}</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Email</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Teléfono</th>
                <th className="text-right px-4 py-3 text-text-secondary font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${client.id}`} className="text-primary hover:text-primary-hover font-medium">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{client.email || '-'}</td>
                  <td className="px-4 py-3 text-text-secondary">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/clients/${client.id}`)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-primary transition-colors" title="Ver">
                        <ExternalLink size={15} />
                      </button>
                      <button onClick={() => navigate(`/clients/${client.id}/edit`)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-primary transition-colors" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(client.id, client.name)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-destructive transition-colors" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersIcon({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
