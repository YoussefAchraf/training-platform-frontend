import { cn } from '@/shared/utils/cn';
import styles from './AttentionDot.module.css';

interface AttentionDotProps {
  className?: string;
}






export function AttentionDot({ className }: AttentionDotProps) {
  return <span className={cn(styles.dot, className)} aria-hidden="true" />;
}
