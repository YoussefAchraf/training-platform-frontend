import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Avatar } from '@/shared/components/Avatar';
import { EmptyState } from '@/shared/components/EmptyState';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import type { InstructorUtilization } from '../utils/dashboardMetrics';
import styles from './InstructorUtilizationList.module.css';

interface InstructorUtilizationListProps {
  data: InstructorUtilization[];
  emptyText: string;
}

export function InstructorUtilizationList({ data, emptyText }: InstructorUtilizationListProps) {
  const { t } = useTranslation('dashboard');

  if (data.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <motion.ul className={styles.list} variants={staggerContainer(0.04)} initial="hidden" animate="show">
      {data.map((entry) => (
        <motion.li key={entry.instructorId} className={styles.row} variants={listItem}>
          <Avatar firstname={entry.firstname} lastname={entry.lastname} size={26} />
          <div className={styles.track}>
            <motion.span
              className={styles.fill}
              initial={{ width: 0 }}
              animate={{ width: `${entry.pct}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className={styles.count}>{t('InstructorUtilizationList.sessionCount', { count: entry.count })}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
