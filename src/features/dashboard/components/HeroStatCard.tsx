import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { fadeInUp } from '@/shared/motion/variants';
import { AnimatedNumber } from '@/shared/components/AnimatedNumber';
import { cn } from '@/shared/utils/cn';
import styles from './HeroStatCard.module.css';

interface HeroStatCardProps {
  id?: string;
  eyebrow: string;
  value: number;
  label: string;
  
  children?: ReactNode;
  className?: string;
}





export function HeroStatCard({ id, eyebrow, value, label, children, className }: HeroStatCardProps) {
  return (
    <motion.div id={id} className={cn(styles.card, className)} variants={fadeInUp}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.top}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <p className={styles.value}>
          <AnimatedNumber value={value} />
        </p>
        <p className={styles.label}>{label}</p>
      </div>
      {children && <div className={styles.body}>{children}</div>}
    </motion.div>
  );
}
