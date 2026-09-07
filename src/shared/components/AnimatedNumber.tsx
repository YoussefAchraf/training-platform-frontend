import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { easeOut } from '@/shared/motion/variants';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}



export function AnimatedNumber({ value, duration = 0.7 }: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: easeOut });
    return controls.stop;
  }, [value, duration, motionValue, shouldReduceMotion]);

  return <motion.span>{rounded}</motion.span>;
}
