import type { ComponentType, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';
import { fadeInUp } from '@/shared/motion/variants';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <motion.div className={styles.wrapper} variants={fadeInUp} initial="hidden" animate="show">
      <div className={styles.iconWrap}>
        <Icon size={26} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </motion.div>
  );
}
