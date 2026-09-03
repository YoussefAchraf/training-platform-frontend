import { create } from 'zustand';
import { roleNameOf, type User } from '@/shared/types/domain';

interface AuthState {
  user: User | null;
  
  
  
  
  
  isBootstrapped: boolean;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  clearSession: () => void;
  finishBootstrap: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isBootstrapped: false,
  setUser: (user) => set({ user, isBootstrapped: true }),
  updateUser: (partial) => set((state) => (state.user ? { user: { ...state.user, ...partial } } : state)),
  clearSession: () => set({ user: null, isBootstrapped: true }),
  finishBootstrap: (user) => set({ user, isBootstrapped: true }),
}));

export function isManager(user: User | null): boolean {
  return roleNameOf(user) === 'Manager';
}

export function isSales(user: User | null): boolean {
  return roleNameOf(user) === 'Sales';
}

export function isInstructor(user: User | null): boolean {
  return roleNameOf(user) === 'Instructor';
}

export function isSuperAdmin(user: User | null): boolean {
  return roleNameOf(user) === 'SuperAdmin';
}

export function isDeveloper(user: User | null): boolean {
  return roleNameOf(user) === 'Developer';
}

export function canManageCatalog(user: User | null): boolean {
  return isSales(user) || isManager(user) || isSuperAdmin(user);
}
