import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 24, className, label = 'Loading' }: SpinnerProps) {
  return (
    <span className={cn(styles.wrapper, className)} role="status">
      <Loader2 size={size} className={styles.icon} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
