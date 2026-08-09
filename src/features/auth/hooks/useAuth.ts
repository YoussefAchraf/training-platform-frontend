import { roleNameOf } from '@/shared/types/domain';
import { canManageCatalog, isInstructor, isManager, isSales, isSuperAdmin, useAuthStore } from '../authStore';

export function useAuth() {
  const rawUser = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  
  
  
  const user = rawUser ? { ...rawUser, role: roleNameOf(rawUser)! } : null;

  return {
    user,
    isBootstrapped,
    isAuthenticated: Boolean(user),
    isManager: isManager(rawUser),
    isSales: isSales(rawUser),
    isInstructor: isInstructor(rawUser),
    isSuperAdmin: isSuperAdmin(rawUser),
    canManageCatalog: canManageCatalog(rawUser),
  };
}
