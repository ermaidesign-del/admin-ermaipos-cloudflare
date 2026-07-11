const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('admin-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string; role: string } }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ id: string; email: string; name: string; role: string }>('/auth/me'),
  },
  clients: {
    list: () => request<any[]>('/clients'),
    get: (id: string) => request<any>(`/clients/${id}`),
    create: (data: { name: string; email?: string; phone?: string; notes?: string }) =>
      request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; email?: string; phone?: string; notes?: string }) =>
      request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/clients/${id}`, { method: 'DELETE' }),
  },
  licenses: {
    list: () => request<any[]>('/licenses'),
    generate: (clientId: string, months: number, maxActivations: number = 0) =>
      request<any>('/licenses/generate', { method: 'POST', body: JSON.stringify({ clientId, months, maxActivations }) }),
    delete: (id: string) => request<any>(`/licenses/${id}`, { method: 'DELETE' }),
  },
  dashboard: () => request<{
    totalClients: number; totalLicenses: number; activeLicenses: number;
    expiringSoon: number; expired: number;
  }>('/dashboard'),
};
