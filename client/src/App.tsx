import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './api/store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientFormPage from './pages/ClientFormPage';
import ClientDetailPage from './pages/ClientDetailPage';
import LicensesPage from './pages/LicensesPage';
import GenerateLicensePage from './pages/GenerateLicensePage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Layout><ClientsPage /></Layout></ProtectedRoute>} />
      <Route path="/clients/new" element={<ProtectedRoute><Layout><ClientFormPage /></Layout></ProtectedRoute>} />
      <Route path="/clients/:id/edit" element={<ProtectedRoute><Layout><ClientFormPage /></Layout></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute><Layout><ClientDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/licenses" element={<ProtectedRoute><Layout><LicensesPage /></Layout></ProtectedRoute>} />
      <Route path="/licenses/generate" element={<ProtectedRoute><Layout><GenerateLicensePage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
