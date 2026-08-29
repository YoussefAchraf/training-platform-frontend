import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUpdateOwnProfile } from '@/features/auth/hooks/useUpdateOwnProfile';
import { useTranslation } from 'react-i18next';
import { useTour } from './useTour';
import { buildDashboardSteps } from './steps/dashboardSteps';
import { withReplayStep } from './tourRoutes';

const AUTO_START_DELAY_MS = 600;





export function useDashboardTour() {
  const { user } = useAuth();
  const { t } = useTranslation('tour');
  const { startTour } = useTour();
  const markSeen = useUpdateOwnProfile();
  const role = user?.role;

  useEffect(() => {
    if (!role || !user || user.hasSeenTour) return;

    const timer = setTimeout(() => {
      startTour(withReplayStep(buildDashboardSteps(role, t), t));
      
      
      markSeen.mutate({ hasSeenTour: true });
    }, AUTO_START_DELAY_MS);
    return () => clearTimeout(timer);
    
    
    
    
  }, [role, user?.hasSeenTour]);
}
