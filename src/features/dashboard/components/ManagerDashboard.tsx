import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, ClipboardCheck, UserCog, Users2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { paths } from '@/routes/paths';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { usePendingUsers } from '@/features/auth/hooks/usePendingUsers';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { SessionMiniList } from './SessionMiniList';
import { StatTileGrid } from './StatTileGrid';
import styles from './Dashboard.module.css';

export function ManagerDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructors } = useSessionLookups();
  const pendingUsersQuery = usePendingUsers();

  const unassignedCount =
    sessionsQuery.data?.filter((session) => session.assignmentStatus === 'unassigned').length ?? 0;
  useAppBadge(unassignedCount + (pendingUsersQuery.data?.length ?? 0));

  if (sessionsQuery.isPending) return <Spinner />;
  if (sessionsQuery.isError) {
    return <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />;
  }

  const sessions = sessionsQuery.data ?? [];
  const upcoming = sessions
    .filter((session) => session.sessionStatus === 'scheduled' || session.sessionStatus === 'ongoing')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);
  const unassigned = sessions.filter((session) => session.assignmentStatus === 'unassigned');

  return (
    <div>
      <StatTileGrid>
        <StatTile id="tour-stat-total-sessions" label={t('ManagerDashboard.totalSessions')} value={sessions.length} icon={CalendarClock} tone="primary" />
        <StatTile id="tour-stat-needs-instructor" label={t('ManagerDashboard.needsInstructor')} value={unassigned.length} icon={UserCog} />
        <StatTile id="tour-stat-instructors" label={t('ManagerDashboard.instructors')} value={instructors.length} icon={Users2} />
        <Link id="tour-stat-pending-approvals" to={paths.pendingApprovals} className={styles.statLink}>
          <StatTile label={t('ManagerDashboard.pendingApprovals')} value={pendingUsersQuery.data?.length ?? '—'} icon={ClipboardCheck} />
        </Link>
      </StatTileGrid>

      <div className={styles.columns}>
        <Card id="tour-card-needs-instructor">
          <h3 className={styles.cardTitle}>{t('ManagerDashboard.needsInstructorCardTitle')}</h3>
          <SessionMiniList
            sessions={unassigned}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('ManagerDashboard.everyAssigned')}
            badge="assignment"
          />
        </Card>

        <Card id="tour-card-upcoming-sessions">
          <h3 className={styles.cardTitle}>{t('ManagerDashboard.upcomingSessionsCardTitle')}</h3>
          <SessionMiniList
            sessions={upcoming}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('ManagerDashboard.noUpcoming')}
          />
        </Card>
      </div>
    </div>
  );
}
