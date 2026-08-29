import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta } from '@/shared/utils/statusMeta';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import { paths } from '@/routes/paths';
import type { Client, Training, TrainingSession } from '@/shared/types/domain';
import styles from './SessionMiniList.module.css';

interface SessionMiniListProps {
  sessions: TrainingSession[];
  trainingMap: Map<number, Training>;
  clientMap: Map<number, Client>;
  emptyText: string;
  badge?: 'status' | 'assignment';
}

function SessionMiniListInner({
  sessions,
  trainingMap,
  clientMap,
  emptyText,
  badge = 'status',
}: SessionMiniListProps) {
  const { t } = useTranslation('dashboard');
  if (sessions.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <motion.ul className={styles.list} variants={staggerContainer(0.04)} initial="hidden" animate="show">
      {sessions.map((session) => (
        <motion.li key={session.id} variants={listItem}>
          <Link to={paths.sessionDetail(session.id)} className={styles.row}>
            <div className={styles.info}>
              <p className={styles.title}>{trainingMap.get(session.trainingId)?.name ?? t('SessionMiniList.unnamedSession', { id: session.id })}</p>
              <p className={styles.subtitle}>
                {clientMap.get(session.clientId)?.companyName ?? t('SessionMiniList.unknownClient')} ·{' '}
                {formatDateTime(session.startDate)}
              </p>
            </div>
            {badge === 'status' ? (
              <Badge
                tone={sessionStatusMeta[session.sessionStatus].tone}
                pulse={sessionStatusMeta[session.sessionStatus].pulse}
              >
                {t(sessionStatusMeta[session.sessionStatus].labelKey)}
              </Badge>
            ) : (
              <Badge
                tone={assignmentStatusMeta[session.assignmentStatus].tone}
                pulse={assignmentStatusMeta[session.assignmentStatus].pulse}
              >
                {t(assignmentStatusMeta[session.assignmentStatus].labelKey)}
              </Badge>
            )}
            <ChevronRight size={16} className={styles.chevron} />
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export const SessionMiniList = memo(SessionMiniListInner);
