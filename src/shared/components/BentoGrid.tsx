import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { staggerContainer } from '@/shared/motion/variants';
import { cn } from '@/shared/utils/cn';
import styles from './BentoGrid.module.css';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}






export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <motion.div className={cn(styles.grid, className)} variants={staggerContainer(0.06)} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
