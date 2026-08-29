import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/shared/hooks/useToast';
import { resolveTourSteps } from './tourRoutes';
import { useTour } from './useTour';
import styles from './TourButton.module.css';

interface TourButtonProps {
  className?: string;
}



export function TourButton({ className }: TourButtonProps) {
  const { t } = useTranslation('common');
  const { t: tTour } = useTranslation('tour');
  const { user } = useAuth();
  const location = useLocation();
  const { startTour } = useTour();
  const toast = useToast();

  const handleClick = () => {
    const steps = resolveTourSteps(location.pathname, user?.role, tTour);
    if (!steps) {
      toast.info(tTour('noGuideAvailable'));
      return;
    }
    startTour(steps);
  };

  return (
    <button
      id="tour-guide-button"
      type="button"
      className={cn(styles.button, className)}
      onClick={handleClick}
      aria-label={t('tour:guideButtonAria')}
      title={t('tour:guideButton')}
    >
      <HelpCircle size={18} />
    </button>
  );
}
