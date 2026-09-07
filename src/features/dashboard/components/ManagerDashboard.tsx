import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Globe2, UserCog, Users2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { BentoGrid } from '@/shared/components/BentoGrid';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { paths } from '@/routes/paths';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { usePendingUsers } from '@/features/auth/hooks/usePendingUsers';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { SessionTimeline } from './SessionTimeline';
import { HeroStatCard } from './HeroStatCard';
import { SessionStatusDonut } from './charts/SessionStatusDonut';
import { WeeklySessionsChart } from './charts/WeeklySessionsChart';
import { InstructorUtilizationList } from './InstructorUtilizationList';
import { ClientWeekendMap } from './ClientWeekendMap';
import {
  computeInstructorUtilization,
  computeStaffingCoverage,
  computeStatusCounts,
  computeWeeklyVolume,
} from '../utils/dashboardMetrics';
import bentoStyles from '@/shared/components/BentoGrid.module.css';
import heroStyles from './HeroStatCard.module.css';
import styles from './Dashboard.module.css';

export function ManagerDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap, instructors } = useSessionLookups();
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

  const statusCounts = computeStatusCounts(sessions);
  const weeklyVolume = computeWeeklyVolume(sessions);
  const utilization = computeInstructorUtilization(sessions, instructors);
  const coverage = computeStaffingCoverage(sessions);

  return (
    <BentoGrid>
      <HeroStatCard
        id="tour-stat-total-sessions"
        className={`${bentoStyles.span2} ${bentoStyles.rowSpan2}`}
        eyebrow={t('ManagerDashboard.totalSessions')}
        value={sessions.length}
        label={t('ManagerDashboard.totalSessionsHint')}
      >
        <div className={heroStyles.ringRow}>
          <ProgressRing pct={coverage.pct} label={t('ManagerDashboard.staffingCoverageLabel', { pct: coverage.pct })} />
          <p className={heroStyles.ringNote}>
            {t('ManagerDashboard.staffingCoverageNote', { assigned: coverage.assigned, total: coverage.total })}
          </p>
        </div>
      </HeroStatCard>

      <StatTile
        id="tour-stat-needs-instructor"
        className={bentoStyles.span2}
        label={t('ManagerDashboard.needsInstructor')}
        value={unassigned.length}
        icon={UserCog}
      />
      <StatTile
        id="tour-stat-instructors"
        className={bentoStyles.span2}
        label={t('ManagerDashboard.instructors')}
        value={instructors.length}
        icon={Users2}
      />

      {/* span4, not span2: with the rowSpan2 hero above, the three other
          span2 tiles fill row 1 exactly, leaving a 2-column gap next to the
          hero in row 2 - span4 completes that row instead of leaving a hole. */}
      <Link id="tour-stat-pending-approvals" to={paths.pendingApprovals} className={`${styles.statLink} ${bentoStyles.span4}`}>
        <StatTile label={t('ManagerDashboard.pendingApprovals')} value={pendingUsersQuery.data?.length ?? '—'} icon={ClipboardCheck} />
      </Link>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('ManagerDashboard.sessionVolumeCardTitle')}</h3>
        <WeeklySessionsChart data={weeklyVolume} />
      </Card>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('ManagerDashboard.statusBreakdownCardTitle', { count: sessions.length })}</h3>
        <SessionStatusDonut counts={statusCounts} emptyText={t('ManagerDashboard.noSessionsYet')} />
      </Card>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>
          <Users2 size={16} aria-hidden="true" /> {t('ManagerDashboard.utilizationCardTitle')}
        </h3>
        <InstructorUtilizationList data={utilization} emptyText={t('ManagerDashboard.noAssignmentsYet')} />
      </Card>

      <Card id="tour-card-upcoming-sessions" className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('ManagerDashboard.upcomingSessionsCardTitle')}</h3>
        <SessionTimeline
          sessions={upcoming}
          trainingMap={trainingMap}
          clientMap={clientMap}
          instructorMap={instructorMap}
          emptyText={t('ManagerDashboard.noUpcoming')}
        />
      </Card>

      {/* Not in the original mockup (which only had "Upcoming sessions"), kept as its
          own card because it already carries a real, tour-anchored click-through to
          each unassigned session - removing it would regress existing functionality
          and break the guided tour's #tour-card-needs-instructor step. */}
      <Card id="tour-card-needs-instructor" className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('ManagerDashboard.needsInstructorCardTitle')}</h3>
        <SessionTimeline
          sessions={unassigned}
          trainingMap={trainingMap}
          clientMap={clientMap}
          emptyText={t('ManagerDashboard.everyAssigned')}
          badge="assignment"
        />
      </Card>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>
          <Globe2 size={16} aria-hidden="true" /> {t('ManagerDashboard.weekendMapCardTitle')}
        </h3>
        <ClientWeekendMap clients={Array.from(clientMap.values())} emptyText={t('ManagerDashboard.noClientsYet')} />
      </Card>
    </BentoGrid>
  );
}
