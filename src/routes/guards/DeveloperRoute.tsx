import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from '../paths';


export function DeveloperRoute() {
  const { isAuthenticated, isDeveloper } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={paths.developerLogin} replace />;
  }

  if (!isDeveloper) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
