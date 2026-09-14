import type { ReactNode } from 'react';
import { BadgeCheck, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { CertificationExpiryStatus } from '@/shared/utils/certificationExpiry';
import styles from './CertificationStatusPill.module.css';

interface CertificationStatusPillProps {
  status: CertificationExpiryStatus;
  children: ReactNode;
  title?: string;
  className?: string;
}

const STATUS_ICON = { none: BadgeCheck, expiring: AlertTriangle, expired: XCircle } as const;
const STATUS_CLASS = { none: styles.pillOk, expiring: styles.pillWarning, expired: styles.pillDanger } as const;






export function CertificationStatusPill({ status, children, title, className }: CertificationStatusPillProps) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={cn(STATUS_CLASS[status], className)} title={title}>
      <Icon size={14} className={styles.icon} aria-hidden="true" />
      {children}
    </span>
  );
}
