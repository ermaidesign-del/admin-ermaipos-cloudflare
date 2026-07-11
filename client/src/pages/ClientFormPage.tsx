import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Save, ArrowLeft } from 'lucide-react';

export default function ClientFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.clients.get(id!).then((client) => {
        setName(client.name);
        setEmail(client.email || '');
        setPhone(client.phone || '');
        setNotes(client.notes || '');
      }).catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.clients.update(id!, { name, email, phone, notes });
      } else {
        await api.clients.create({ name, email, phone, notes });
      }
      navigate('/clients');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-text-secondary">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/clients')} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md bg-surface border border-border rounded-xl p-6 space-y-4">
        {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-2 text-sm">{error}</div>}

        <div>
          <label className="block text-sm text-text-secondary mb-1">Nombre *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
            placeholder="Nombre del cliente" />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
            placeholder="cliente@email.com" />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Teléfono</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
            placeholder="+54 11 1234-5678" />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
            placeholder="Notas adicionales..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving || !name.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/clients')}
            className="bg-surface-hover hover:bg-border text-text-secondary rounded-lg px-4 py-2.5 text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
