import { motion, useReducedMotion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import styles from './Card.module.css';

interface CardProps extends HTMLMotionProps<'div'> {
  padded?: boolean;
  interactive?: boolean;
}

export function Card({ padded = true, interactive = false, className, ...rest }: CardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(styles.card, padded && styles.padded, interactive && styles.interactive, className)}
      whileHover={interactive && !shouldReduceMotion ? { y: -2 } : undefined}
      whileTap={interactive && !shouldReduceMotion ? { scale: 0.99, y: 0 } : undefined}
      transition={{ duration: 0.15 }}
      {...rest}
    />
  );
}
