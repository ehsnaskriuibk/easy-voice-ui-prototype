import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { ToastProvider } from '@/context/ToastContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardShell } from '@/components/layout/DashboardShell';

function AppInner() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardShell /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
