import { create } from 'zustand';
import { api } from './client';

interface AdminUser {
  id: string; email: string; name: string; role: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: JSON.parse(localStorage.getItem('admin-user') || 'null'),
  token: localStorage.getItem('admin-token'),
  isAuthenticated: !!localStorage.getItem('admin-token'),

  login: async (email, password) => {
    try {
      const result = await api.auth.login(email, password);
      localStorage.setItem('admin-token', result.token);
      localStorage.setItem('admin-user', JSON.stringify(result.user));
      set({ user: result.user, token: result.token, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
  },

  logout: () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
