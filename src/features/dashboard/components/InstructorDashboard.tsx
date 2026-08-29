import { useTranslation } from 'react-i18next';
import { CalendarCheck2, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { SessionMiniList } from './SessionMiniList';
import { StatTileGrid } from './StatTileGrid';
import styles from './Dashboard.module.css';

export function InstructorDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap } = useSessionLookups();

  if (sessionsQuery.isPending) return <Spinner />;
  if (sessionsQuery.isError) {
    return <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />;
  }

  const sessions = sessionsQuery.data ?? [];
  
  
  
  
  const completed = sessions
    .filter((session) => session.sessionStatus === 'completed')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);
  const upcoming = sessions
    .filter(
      (session) =>
        session.assignmentStatus === 'accepted' &&
        (session.sessionStatus === 'scheduled' || session.sessionStatus === 'ongoing'),
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div>
      <StatTileGrid>
        <StatTile id="tour-stat-my-sessions" label={t('InstructorDashboard.mySessions')} value={sessions.length} icon={CalendarClock} tone="primary" />
        <StatTile id="tour-stat-completed" label={t('InstructorDashboard.completedSessions')} value={completed.length} icon={CheckCircle2} />
        <StatTile id="tour-stat-upcoming-accepted" label={t('InstructorDashboard.upcomingAccepted')} value={upcoming.length} icon={CalendarCheck2} />
      </StatTileGrid>

      <div className={styles.columns}>
        <Card id="tour-card-recently-completed">
          <h3 className={styles.cardTitle}>{t('InstructorDashboard.recentlyCompletedCardTitle')}</h3>
          <SessionMiniList
            sessions={completed}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('InstructorDashboard.noCompletedYet')}
          />
        </Card>

        <Card id="tour-card-your-sessions">
          <h3 className={styles.cardTitle}>{t('InstructorDashboard.yourSessionsCardTitle')}</h3>
          <SessionMiniList
            sessions={upcoming}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('InstructorDashboard.noScheduled')}
          />
        </Card>
      </div>
    </div>
  );
}
