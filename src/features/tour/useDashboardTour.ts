import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTourStore } from './tourStore';
import { useTour } from './useTour';

const AUTO_START_DELAY_MS = 600;


export function useDashboardTour() {
  const { user } = useAuth();
  const { startTour } = useTour();
  const pendingStart = useTourStore((state) => state.pendingStart);
  const seenRoles = useTourStore((state) => state.seenRoles);
  const clearPendingStart = useTourStore((state) => state.clearPendingStart);
  const markSeen = useTourStore((state) => state.markSeen);
  const role = user?.role;

  useEffect(() => {
    if (!role) return;

    if (pendingStart) {
      clearPendingStart();
      startTour(role);
      return;
    }

    if (seenRoles[role]) return;

    const timer = setTimeout(() => {
      startTour(role);
      markSeen(role);
    }, AUTO_START_DELAY_MS);
    return () => clearTimeout(timer);
    
    
    
    
  }, [role]);
}
