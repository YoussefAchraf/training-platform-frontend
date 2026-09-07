import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Badge } from '@/shared/components/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import { sessionStatusMeta } from '@/shared/utils/statusMeta';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import type { AdminSessionOverview } from '@/shared/types/domain';




import styles from './SessionTimeline.module.css';

interface AdminSessionTimelineProps {
  sessions: AdminSessionOverview[];
  emptyText: string;
}

function AdminSessionTimelineInner({ sessions, emptyText }: AdminSessionTimelineProps) {
  const { t } = useTranslation('dashboard');

  if (sessions.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <motion.ul className={styles.list} variants={staggerContainer(0.04)} initial="hidden" animate="show">
      {sessions.map((session) => {
        const meta = sessionStatusMeta[session.sessionStatus];
        const isSettled = meta.tone === 'success' || meta.tone === 'info';

        return (
          <motion.li key={session.id} className={styles.item} variants={listItem}>
            <span className={cn(styles.dot, isSettled && styles.dotFilled)} aria-hidden="true" />
            <Link to={paths.sessionDetail(session.id)} className={styles.row}>
              <div className={styles.info}>
                <p className={styles.title}>{session.trainingName}</p>
                <p className={styles.subtitle}>
                  {session.clientCompanyName} · {formatDateTime(session.startDate)}
                  {session.instructorName && (
                    <>
                      {' '}
                      · {session.instructorName}
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

export const AdminSessionTimeline = memo(AdminSessionTimelineInner);
