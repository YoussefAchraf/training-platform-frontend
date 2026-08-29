import { useTranslation } from 'react-i18next';
import { CalendarCheck2, CalendarClock, ClipboardList } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { SessionMiniList } from './SessionMiniList';
import { StatTileGrid } from './StatTileGrid';
import styles from './Dashboard.module.css';

export function InstructorDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap } = useSessionLookups();

  const needsResponseCount =
    sessionsQuery.data?.filter((session) => session.assignmentStatus === 'pending').length ?? 0;
  useAppBadge(needsResponseCount);

  if (sessionsQuery.isPending) return <Spinner />;
  if (sessionsQuery.isError) {
    return <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />;
  }

  const sessions = sessionsQuery.data ?? [];
  const needsResponse = sessions.filter((session) => session.assignmentStatus === 'pending');
  
  
  
  
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
        <StatTile label={t('InstructorDashboard.mySessions')} value={sessions.length} icon={CalendarClock} tone="primary" />
        <StatTile label={t('InstructorDashboard.awaitingResponse')} value={needsResponse.length} icon={ClipboardList} />
        <StatTile label={t('InstructorDashboard.upcomingAccepted')} value={upcoming.length} icon={CalendarCheck2} />
      </StatTileGrid>

      <div className={styles.columns}>
        <Card>
          <h3 className={styles.cardTitle}>{t('InstructorDashboard.awaitingResponseCardTitle')}</h3>
          <SessionMiniList
            sessions={needsResponse}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('InstructorDashboard.nothingWaiting')}
            badge="assignment"
          />
        </Card>

        <Card>
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
