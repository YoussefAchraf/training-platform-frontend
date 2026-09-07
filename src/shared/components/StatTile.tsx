import type { ComponentType, ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import { fadeInUp } from '@/shared/motion/variants';
import { AnimatedNumber } from './AnimatedNumber';
import styles from './StatTile.module.css';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: ComponentType<{ size?: number }>;
  tone?: 'primary' | 'neutral' | 'success' | 'info' | 'warning';
  id?: string;
  className?: string;
  
  footnote?: ReactNode;
}

export function StatTile({ label, value, icon: Icon, tone = 'neutral', id, className, footnote }: StatTileProps) {
  return (
    <motion.div id={id} className={cn(styles.tile, styles[tone], className)} variants={fadeInUp}>
      <div className={styles.top}>
        {Icon && (
          <span className={styles.iconWrap}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={styles.text}>
        <p className={styles.value}>{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</p>
        <p className={styles.label}>{label}</p>
        {footnote && <div className={styles.footnote}>{footnote}</div>}
      </div>
    </motion.div>
  );
}
