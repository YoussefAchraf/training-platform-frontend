import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Badge } from '@/shared/components/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta } from '@/shared/utils/statusMeta';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import type { Client, Instructor, Training, TrainingSession } from '@/shared/types/domain';
import styles from './SessionTimeline.module.css';

interface SessionTimelineProps {
  sessions: TrainingSession[];
  trainingMap: Map<number, Training>;
  clientMap: Map<number, Client>;
  emptyText: string;
  badge?: 'status' | 'assignment';
  instructorMap?: Map<number, Instructor>;
}




function SessionTimelineInner({
  sessions,
  trainingMap,
  clientMap,
  emptyText,
  badge = 'status',
  instructorMap,
}: SessionTimelineProps) {
  const { t } = useTranslation('dashboard');

  if (sessions.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <motion.ul className={styles.list} variants={staggerContainer(0.04)} initial="hidden" animate="show">
      {sessions.map((session) => {
        const instructor = session.instructorId ? instructorMap?.get(session.instructorId) : undefined;
        const meta = badge === 'status' ? sessionStatusMeta[session.sessionStatus] : assignmentStatusMeta[session.assignmentStatus];
        const isSettled = meta.tone === 'success' || meta.tone === 'info';

        return (
          <motion.li key={session.id} className={styles.item} variants={listItem}>
            <span className={cn(styles.dot, isSettled && styles.dotFilled)} aria-hidden="true" />
            <Link to={paths.sessionDetail(session.id)} className={styles.row}>
              <div className={styles.info}>
                <p className={styles.title}>
                  {trainingMap.get(session.trainingId)?.name ?? t('SessionMiniList.unnamedSession', { id: session.id })}
                </p>
                <p className={styles.subtitle}>
                  {clientMap.get(session.clientId)?.companyName ?? t('SessionMiniList.unknownClient')} ·{' '}
                  {formatDateTime(session.startDate)}
                  {instructor && (
                    <>
                      {' '}
                      · {instructor.firstname} {instructor.lastname}
                    </>
                  )}
                </p>
              </div>
              <Badge tone={meta.tone} pulse={meta.pulse}>
                {t(meta.labelKey)}
              </Badge>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export const SessionTimeline = memo(SessionTimelineInner);
