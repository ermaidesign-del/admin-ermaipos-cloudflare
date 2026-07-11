import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Key, LogOut } from 'lucide-react';
import { useAuthStore } from '../api/store';
import logoSrc from '../logo_EMP.png';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/licenses', icon: Key, label: 'Licencias' },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <img src={logoSrc} alt="ERMAIPOS" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-lg font-bold text-primary">ERMAIPOS</h1>
          <p className="text-xs text-text-secondary">Panel de Administración</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="px-3 py-2 text-xs text-text-secondary truncate">{user?.name}</div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-text-secondary hover:text-destructive hover:bg-surface-hover transition-colors"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
