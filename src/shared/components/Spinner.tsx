import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 24, className, label }: SpinnerProps) {
  const { t } = useTranslation('common');
  return (
    <span className={cn(styles.wrapper, className)} role="status">
      <Loader2 size={size} className={styles.icon} aria-hidden="true" />
      <span className="visually-hidden">{label ?? t('Spinner.loading')}</span>
    </span>
  );
}
