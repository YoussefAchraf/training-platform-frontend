import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from './paths';
import { prefetchRoutesIdle } from './routeModules';


export function useIdlePrefetch(): void {
  const { isInstructor, canManageCatalog } = useAuth();

  useEffect(() => {
    if (isInstructor) {
      prefetchRoutesIdle([paths.calendar]);
    } else if (canManageCatalog) {
      prefetchRoutesIdle([paths.sessions, paths.calendar]);
    }
  }, [isInstructor, canManageCatalog]);
}
