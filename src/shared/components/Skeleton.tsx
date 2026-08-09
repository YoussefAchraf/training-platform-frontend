import type { CSSProperties } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1em', radius, className }: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  };
  return <span className={cn(styles.skeleton, className)} style={style} aria-hidden="true" />;
}
