import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import { easeOut, fadeInUp } from '@/shared/motion/variants';
import styles from './StatTile.module.css';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: ComponentType<{ size?: number }>;
  tone?: 'primary' | 'neutral';
  id?: string;
  className?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: 0.7, ease: easeOut });
    return controls.stop;
  }, [value, motionValue, shouldReduceMotion]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatTile({ label, value, icon: Icon, tone = 'neutral', id, className }: StatTileProps) {
  return (
    <motion.div id={id} className={cn(styles.tile, tone === 'primary' && styles.primary, className)} variants={fadeInUp}>
      {Icon && (
        <span className={styles.iconWrap}>
          <Icon size={18} />
        </span>
      )}
      <div className={styles.text}>
        <p className={styles.value}>{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </motion.div>
  );
}
