import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './PwaStatScrollRow.module.css';

interface PwaStatScrollRowProps {
  children: ReactNode;
  
  wide?: boolean;
  className?: string;
}


export function PwaStatScrollRow({ children, wide = false, className }: PwaStatScrollRowProps) {
  return <div className={cn(styles.row, wide && styles.wide, className)}>{children}</div>;
}
