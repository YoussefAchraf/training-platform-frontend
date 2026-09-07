import { motion, useReducedMotion } from 'motion/react';
import { easeOut } from '@/shared/motion/variants';

interface ProgressRingProps {
  
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  className?: string;
}




export function ProgressRing({
  pct,
  size = 56,
  strokeWidth = 6,
  color = 'var(--color-primary)',
  trackColor = 'rgb(255 255 255 / 15%)',
  label,
  className,
}: ProgressRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.min(Math.max(pct, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${Math.round(clamped)}%`} className={className}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        transform={`rotate(-90 ${center} ${center})`}
        initial={{ strokeDashoffset: shouldReduceMotion ? offset : circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: easeOut }}
      />
    </svg>
  );
}
