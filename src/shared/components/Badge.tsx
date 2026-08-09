import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import type { Tone } from '@/shared/utils/statusMeta';
import styles from './Badge.module.css';

interface BadgeProps {
  tone?: Tone;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', pulse = false, children, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], className)}>
      {pulse && (
        <span className={styles.pulseDot} aria-hidden="true">
          <span className={styles.pulseDotPing} />
        </span>
      )}
      {children}
    </span>
  );
}
