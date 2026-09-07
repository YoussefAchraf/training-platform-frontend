import { motion, useReducedMotion } from 'motion/react';
import { easeOut } from '@/shared/motion/variants';

interface BookingTrendSparklineProps {
  series: number[];
  width?: number;
  height?: number;
  color?: string;
  label: string;
  className?: string;
}




export function BookingTrendSparkline({
  series,
  width = 260,
  height = 56,
  color = 'var(--color-primary)',
  label,
  className,
}: BookingTrendSparklineProps) {
  const shouldReduceMotion = useReducedMotion();
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = max - min || 1;
  const padding = 4;
  const drawableHeight = height - padding * 2;
  const stepX = series.length > 1 ? width / (series.length - 1) : width;

  const points = series
    .map((value, index) => {
      const x = index * stepX;
      const y = padding + drawableHeight - ((value - min) / range) * drawableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={label} className={className}>
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: easeOut }}
      />
    </svg>
  );
}
