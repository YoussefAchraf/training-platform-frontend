import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import { useTourStore } from './tourStore';
import styles from './TourButton.module.css';

interface TourButtonProps {
  className?: string;
}


export function TourButton({ className }: TourButtonProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const requestStart = useTourStore((state) => state.requestStart);

  const handleClick = () => {
    requestStart();
    navigate(paths.dashboard);
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
