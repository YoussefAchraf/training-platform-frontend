import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Role } from '@/shared/types/domain';
import { Forbidden } from './Forbidden';

interface RoleRouteProps {
  allowed: Role[];
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowed.includes(user.role)) {
    return <Forbidden />;
  }

  return <Outlet />;
}
