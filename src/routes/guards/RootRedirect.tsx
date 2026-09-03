import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from '../paths';

export function RootRedirect() {
  const { isAuthenticated, isDeveloper } = useAuth();
  if (!isAuthenticated) return <Navigate to={paths.login} replace />;
  return <Navigate to={isDeveloper ? paths.developer : paths.dashboard} replace />;
}
