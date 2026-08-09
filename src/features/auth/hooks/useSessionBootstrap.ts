import { useEffect } from 'react';
import { setRoleCatalog } from '@/shared/types/domain';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../authStore';


export function useSessionBootstrap(): boolean {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then(async ({ user }) => {
        if (cancelled) return;
        if (!user) {
          finishBootstrap(null);
          return;
        }
        const roles = await authApi.listRoles();
        if (cancelled) return;
        setRoleCatalog(roles);
        finishBootstrap(user);
      })
      .catch(() => {
        if (!cancelled) finishBootstrap(null);
      });
    return () => {
      cancelled = true;
    };
    
  }, []);

  return isBootstrapped;
}
