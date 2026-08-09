import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { staggerContainer } from '@/shared/motion/variants';
import styles from './Dashboard.module.css';

export function StatTileGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div className={styles.statsGrid} variants={staggerContainer(0.06)} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
