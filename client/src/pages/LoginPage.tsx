import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../api/store';
import { LogIn } from 'lucide-react';
import logoSrc from '../logo_EMP.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/', { replace: true });
    else setError(result.error || 'Error al iniciar sesión');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoSrc} alt="ERMAIPOS" className="w-32 h-32 object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-primary">ERMAIPOS</h1>
          <p className="text-text-secondary mt-1">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Iniciar Sesión</h2>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-2 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="admin@ermaipos.com" required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Contraseña</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••" required
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <LogIn size={16} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
