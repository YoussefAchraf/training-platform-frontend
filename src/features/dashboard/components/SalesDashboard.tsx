import { useTranslation } from 'react-i18next';
import { Building2, GraduationCap, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { BentoGrid } from '@/shared/components/BentoGrid';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { cn } from '@/shared/utils/cn';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { useProviders } from '@/features/providers/hooks/useProviders';
import { useClients } from '@/features/clients/hooks/useClients';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { SessionTimeline } from './SessionTimeline';
import { HeroStatCard } from './HeroStatCard';
import { BookingTrendSparkline } from './BookingTrendSparkline';
import { computeBookingTrend, computeWeeklyVolume } from '../utils/dashboardMetrics';
import bentoStyles from '@/shared/components/BentoGrid.module.css';
import heroStyles from './HeroStatCard.module.css';
import styles from './Dashboard.module.css';

export function SalesDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();
  const providersQuery = useProviders();
  const trainingsQuery = useTrainings();
  const clientsQuery = useClients();

  const unassignedCount = sessionsQuery.data?.filter((session) => session.assignmentStatus === 'unassigned').length ?? 0;
  useAppBadge(unassignedCount);

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

  const clients = clientsQuery.data ?? [];
  const now = new Date();
  const clientsThisMonth = clients.filter((client) => {
    const created = new Date(client.createdAt);
    return !Number.isNaN(created.getTime()) && created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;

  const bookingTrend = computeBookingTrend(sessions, now);
  const bookingSeries = computeWeeklyVolume(sessions, 8, 0, now, (session) => session.createdAt).map((point) => point.count);
  const isTrendingDown = bookingTrend.deltaPct !== null && bookingTrend.deltaPct < 0;
  const TrendIcon = isTrendingDown ? TrendingDown : TrendingUp;

  return (
    <BentoGrid>
      <HeroStatCard
        id="tour-stat-total-sessions"
        className={`${bentoStyles.span2} ${bentoStyles.rowSpan2}`}
        eyebrow={t('SalesDashboard.totalSessions')}
        value={sessions.length}
        label={t('SalesDashboard.totalSessionsHint')}
      >
        <div className={heroStyles.trendRow}>
          <div className={heroStyles.trendHeader}>
            <span className={heroStyles.trendEyebrow}>{t('SalesDashboard.thisQuarterLabel')}</span>
            {bookingTrend.deltaPct !== null && (
              <span className={cn(heroStyles.trendDelta, isTrendingDown ? heroStyles.trendDown : heroStyles.trendUp)}>
                <TrendIcon size={12} aria-hidden="true" />
                {bookingTrend.deltaPct > 0 ? '+' : ''}
                {bookingTrend.deltaPct}% {t('SalesDashboard.vsLastQuarter')}
              </span>
            )}
          </div>
          <p className={heroStyles.trendCount}>{t('SalesDashboard.sessionsBooked', { count: bookingTrend.currentQuarterCount })}</p>
          <BookingTrendSparkline series={bookingSeries} className={heroStyles.sparkline} label={t('SalesDashboard.sparklineLabel')} />
        </div>
      </HeroStatCard>

      <StatTile
        id="tour-stat-providers"
        className={bentoStyles.span2}
        label={t('SalesDashboard.providers')}
        value={providersQuery.data?.length ?? '—'}
        icon={Building2}
        tone="primary"
      />
      <StatTile
        id="tour-stat-trainings"
        className={bentoStyles.span2}
        label={t('SalesDashboard.trainings')}
        value={trainingsQuery.data?.length ?? '—'}
        icon={GraduationCap}
        tone="info"
      />
      <StatTile
        id="tour-stat-clients"
        className={bentoStyles.span2}
        label={t('SalesDashboard.clients')}
        value={clientsQuery.data?.length ?? '—'}
        icon={Users}
        tone="success"
        footnote={clientsThisMonth > 0 ? t('SalesDashboard.clientsThisMonth', { count: clientsThisMonth }) : undefined}
      />

      <Card id="tour-card-awaiting-assignment" className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('SalesDashboard.awaitingAssignmentCardTitle')}</h3>
        <SessionTimeline sessions={unassigned} trainingMap={trainingMap} clientMap={clientMap} emptyText={t('SalesDashboard.everyAssigned')} badge="assignment" />
      </Card>

      <Card id="tour-card-upcoming-sessions" className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('SalesDashboard.upcomingSessionsCardTitle')}</h3>
        <SessionTimeline
          sessions={upcoming}
          trainingMap={trainingMap}
          clientMap={clientMap}
          instructorMap={instructorMap}
          emptyText={t('SalesDashboard.noUpcoming')}
        />
      </Card>
    </BentoGrid>
  );
}
