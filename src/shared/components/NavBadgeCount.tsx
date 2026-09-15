import { cn } from '@/shared/utils/cn';
import styles from './NavBadgeCount.module.css';

interface NavBadgeCountProps {
  count: number;
  className?: string;
  variant?: 'inline' | 'corner';
}

export function NavBadgeCount({ count, className, variant = 'inline' }: NavBadgeCountProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(styles.badge, variant === 'corner' && styles.corner, className)}
      aria-hidden="true"
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
