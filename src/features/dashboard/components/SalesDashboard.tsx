import { useTranslation } from 'react-i18next';
import { Building2, CalendarClock, GraduationCap, Users } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { useProviders } from '@/features/providers/hooks/useProviders';
import { useClients } from '@/features/clients/hooks/useClients';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import { SessionMiniList } from './SessionMiniList';
import { StatTileGrid } from './StatTileGrid';
import styles from './Dashboard.module.css';

export function SalesDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap } = useSessionLookups();
  const providersQuery = useProviders();
  const trainingsQuery = useTrainings();
  const clientsQuery = useClients();

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
        <StatTile label={t('SalesDashboard.totalSessions')} value={sessions.length} icon={CalendarClock} tone="primary" />
        <StatTile label={t('SalesDashboard.providers')} value={providersQuery.data?.length ?? '—'} icon={Building2} />
        <StatTile label={t('SalesDashboard.trainings')} value={trainingsQuery.data?.length ?? '—'} icon={GraduationCap} />
        <StatTile label={t('SalesDashboard.clients')} value={clientsQuery.data?.length ?? '—'} icon={Users} />
      </StatTileGrid>

      <div className={styles.columns}>
        <Card>
          <h3 className={styles.cardTitle}>{t('SalesDashboard.awaitingAssignmentCardTitle')}</h3>
          <SessionMiniList
            sessions={unassigned}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('SalesDashboard.everyAssigned')}
            badge="assignment"
          />
        </Card>

        <Card>
          <h3 className={styles.cardTitle}>{t('SalesDashboard.upcomingSessionsCardTitle')}</h3>
          <SessionMiniList
            sessions={upcoming}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('SalesDashboard.noUpcoming')}
          />
        </Card>
      </div>
    </div>
  );
}
