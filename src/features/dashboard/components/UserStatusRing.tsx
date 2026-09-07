import { motion, useReducedMotion } from 'motion/react';
import { easeOut } from '@/shared/motion/variants';

export interface RingSegment {
  key: string;
  value: number;
  color: string;
}

interface UserStatusRingProps {
  segments: RingSegment[];
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  label: string;
  className?: string;
}




export function UserStatusRing({
  segments,
  size = 120,
  strokeWidth = 16,
  trackColor = 'rgb(255 255 255 / 12%)',
  label,
  className,
}: UserStatusRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  
  
  
  const arcs = segments
    .filter((segment) => segment.value > 0)
    .reduce<Array<RingSegment & { arcLength: number; offset: number }>>((acc, segment) => {
      const drawnSoFar = acc.reduce((sum, arc) => sum + arc.arcLength, 0);
      const fraction = total > 0 ? segment.value / total : 0;
      const arcLength = fraction * circumference;
      return [...acc, { ...segment, arcLength, offset: -drawnSoFar }];
    }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className={className}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {arcs.map((arc, index) => (
        <motion.circle
          key={arc.key}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc.arcLength} ${circumference}`}
          strokeDashoffset={arc.offset}
          transform={`rotate(-90 ${center} ${center})`}
          initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOut, delay: shouldReduceMotion ? 0 : index * 0.12 }}
        />
      ))}
    </svg>
  );
}
