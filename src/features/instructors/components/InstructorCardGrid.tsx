import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@/shared/components/Skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { staggerContainer } from '@/shared/motion/variants';
import type { Instructor } from '@/shared/types/domain';
import { InstructorCard } from './InstructorCard';
import styles from './InstructorCardGrid.module.css';

interface InstructorCardGridProps {
  instructors: Instructor[];
  canEdit: boolean;
  onEdit: (instructor: Instructor) => void;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

export function InstructorCardGrid({ instructors, canEdit, onEdit, isLoading, emptyTitle, emptyDescription, emptyAction }: InstructorCardGridProps) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} height={220} radius="var(--radius-lg)" />
        ))}
      </div>
    );
  }

  if (instructors.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <motion.div className={styles.grid} variants={staggerContainer(0.04)} initial="hidden" animate="show">
      {instructors.map((instructor) => (
        <InstructorCard key={instructor.id} instructor={instructor} canEdit={canEdit} onEdit={() => onEdit(instructor)} />
      ))}
    </motion.div>
  );
}
