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
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();
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
        <StatTile id="tour-stat-total-sessions" label={t('SalesDashboard.totalSessions')} value={sessions.length} icon={CalendarClock} tone="primary" />
        <StatTile id="tour-stat-providers" label={t('SalesDashboard.providers')} value={providersQuery.data?.length ?? '—'} icon={Building2} />
        <StatTile id="tour-stat-trainings" label={t('SalesDashboard.trainings')} value={trainingsQuery.data?.length ?? '—'} icon={GraduationCap} />
        <StatTile id="tour-stat-clients" label={t('SalesDashboard.clients')} value={clientsQuery.data?.length ?? '—'} icon={Users} />
      </StatTileGrid>

      <div className={styles.columns}>
        <Card id="tour-card-awaiting-assignment">
          <h3 className={styles.cardTitle}>{t('SalesDashboard.awaitingAssignmentCardTitle')}</h3>
          <SessionMiniList
            sessions={unassigned}
            trainingMap={trainingMap}
            clientMap={clientMap}
            emptyText={t('SalesDashboard.everyAssigned')}
            badge="assignment"
          />
        </Card>

        <Card id="tour-card-upcoming-sessions">
          <h3 className={styles.cardTitle}>{t('SalesDashboard.upcomingSessionsCardTitle')}</h3>
          <SessionMiniList
            sessions={upcoming}
            trainingMap={trainingMap}
            clientMap={clientMap}
            instructorMap={instructorMap}
            emptyText={t('SalesDashboard.noUpcoming')}
          />
        </Card>
      </div>
    </div>
  );
}
