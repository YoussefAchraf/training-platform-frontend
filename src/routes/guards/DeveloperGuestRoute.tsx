import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from '../paths';


export function DeveloperGuestRoute() {
  const { isAuthenticated, isDeveloper } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isDeveloper ? paths.developer : paths.dashboard} replace />;
  }

  return <Outlet />;
}
