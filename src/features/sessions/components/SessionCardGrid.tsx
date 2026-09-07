import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@/shared/components/Skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { staggerContainer } from '@/shared/motion/variants';
import type { Client, Instructor, Training, TrainingSession } from '@/shared/types/domain';
import { SessionCard } from './SessionCard';
import styles from './SessionCardGrid.module.css';

interface SessionCardGridProps {
  sessions: TrainingSession[];
  trainingMap: Map<number, Training>;
  clientMap: Map<number, Client>;
  instructorMap: Map<number, Instructor>;
  showInstructor: boolean;
  onCardClick: (session: TrainingSession) => void;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

export function SessionCardGrid({
  sessions,
  trainingMap,
  clientMap,
  instructorMap,
  showInstructor,
  onCardClick,
  isLoading,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: SessionCardGridProps) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} height={220} radius="var(--radius-lg)" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <motion.div className={styles.grid} variants={staggerContainer(0.04)} initial="hidden" animate="show">
      {sessions.map((session) => {
        const training = trainingMap.get(session.trainingId);
        const client = clientMap.get(session.clientId);
        const instructor = session.instructorId != null ? instructorMap.get(session.instructorId) : undefined;

        return (
          <SessionCard
            key={session.id}
            session={session}
            trainingName={training?.name ?? `#${session.trainingId}`}
            clientName={client?.companyName ?? `#${session.clientId}`}
            clientCountry={client?.country ?? null}
            instructorName={instructor ? `${instructor.firstname} ${instructor.lastname}` : null}
            showInstructor={showInstructor}
            onClick={() => onCardClick(session)}
          />
        );
      })}
    </motion.div>
  );
}
