import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/shared/types/domain';

interface TourState {
  
  seenRoles: Partial<Record<Role, boolean>>;
  
  pendingStart: boolean;
  markSeen: (role: Role) => void;
  requestStart: () => void;
  clearPendingStart: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      seenRoles: {},
      pendingStart: false,
      markSeen: (role) => set((state) => ({ seenRoles: { ...state.seenRoles, [role]: true } })),
      requestStart: () => set({ pendingStart: true }),
      clearPendingStart: () => set({ pendingStart: false }),
    }),
    {
      name: 'training-platform-tour-seen',
      partialize: (state) => ({ seenRoles: state.seenRoles }),
    },
  ),
);
