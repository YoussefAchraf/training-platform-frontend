import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, History, ShieldAlert, UserCog, Users2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { BentoGrid } from '@/shared/components/BentoGrid';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { useAdminSessionsOverview } from '@/features/admin/hooks/useAdminSessionsOverview';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { HeroStatCard } from '@/features/dashboard/components/HeroStatCard';
import { UserStatusRing } from '@/features/dashboard/components/UserStatusRing';
import { AdminSessionTimeline } from '@/features/dashboard/components/AdminSessionTimeline';
import { SessionStatusDonut } from '@/features/dashboard/components/charts/SessionStatusDonut';
import { WeeklySessionsChart } from '@/features/dashboard/components/charts/WeeklySessionsChart';
import { RoleBreakdownChart } from '@/features/dashboard/components/charts/RoleBreakdownChart';
import { InstructorUtilizationList } from '@/features/dashboard/components/InstructorUtilizationList';
import {
  computeAdminInstructorUtilization,
  computeRoleBreakdown,
  computeStatusCounts,
  computeWeeklyVolume,
} from '@/features/dashboard/utils/dashboardMetrics';
import bentoStyles from '@/shared/components/BentoGrid.module.css';
import styles from '@/features/dashboard/components/Dashboard.module.css';
import quickLinkStyles from '@/features/dashboard/components/SuperAdminDashboard.module.css';
import { PwaStatScrollRow } from './PwaStatScrollRow';







export function PwaSuperAdminDashboard() {
  const { t } = useTranslation('dashboard');
  const usersQuery = useAdminUsers();
  const sessionsQuery = useAdminSessionsOverview();

  const pendingSignupsCount = usersQuery.data?.filter((user) => user.status === 'pending').length ?? 0;
  useAppBadge(pendingSignupsCount);

  if (usersQuery.isPending || sessionsQuery.isPending) return <Spinner />;
  if (usersQuery.isError) {
    return <ErrorBanner error={usersQuery.error} onRetry={() => usersQuery.refetch()} />;
  }
  if (sessionsQuery.isError) {
    return <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />;
  }

  const users = usersQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const pendingCount = users.filter((user) => user.status === 'pending').length;
  const approvedCount = users.filter((user) => user.status === 'approved').length;
  const deactivatedCount = users.filter((user) => user.status === 'deactivated').length;
  const rejectedCount = users.filter((user) => user.status === 'rejected').length;

  const ringSegments = [
    { key: 'approved', value: approvedCount, color: 'var(--green-500)' },
    { key: 'pending', value: pendingCount, color: 'var(--color-warning)' },
    { key: 'deactivated', value: deactivatedCount, color: 'var(--grey-500)' },
    { key: 'rejected', value: rejectedCount, color: 'var(--color-primary)' },
  ];

  const roleBreakdown = computeRoleBreakdown(users);
  const statusCounts = computeStatusCounts(sessions);
  const weeklyVolume = computeWeeklyVolume(sessions);
  const instructorUtilization = computeAdminInstructorUtilization(sessions, 5);
  const upcoming = sessions
    .filter((session) => session.sessionStatus === 'scheduled' || session.sessionStatus === 'ongoing')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const quickLinks = [
    {
      id: 'tour-quicklink-users',
      to: paths.superAdminUsers,
      icon: UserCog,
      tone: 'iconPrimary' as const,
      label: t('SuperAdminDashboard.manageUsers'),
      description: t('SuperAdminDashboard.manageUsersDescription'),
    },
    {
      id: 'tour-quicklink-sessions',
      to: paths.superAdminSessions,
      icon: CalendarClock,
      tone: 'iconInfo' as const,
      label: t('SuperAdminDashboard.sessionsOverview'),
      description: t('SuperAdminDashboard.sessionsOverviewDescription'),
    },
    {
      id: 'tour-quicklink-audit',
      to: paths.auditLog,
      icon: History,
      tone: 'iconNeutral' as const,
      label: t('SuperAdminDashboard.auditLog'),
      description: t('SuperAdminDashboard.auditLogDescription'),
    },
  ];

  return (
    <BentoGrid>
      <HeroStatCard
        id="tour-stat-total-users"
        className={bentoStyles.span2}
        eyebrow={t('SuperAdminDashboard.companyWideLabel')}
        value={users.length}
        label={t('SuperAdminDashboard.totalUsersHint')}
      >
        <UserStatusRing
          segments={ringSegments}
          label={t('SuperAdminDashboard.ringLabel', { approved: approvedCount, pending: pendingCount, deactivated: deactivatedCount })}
        />
      </HeroStatCard>

      <PwaStatScrollRow>
        <StatTile id="tour-stat-pending-signups" label={t('SuperAdminDashboard.pendingSignups')} value={pendingCount} icon={ShieldAlert} tone="warning" />
        <StatTile id="tour-stat-deactivated" label={t('SuperAdminDashboard.deactivated')} value={deactivatedCount} icon={UserCog} tone="neutral" />
        <StatTile id="tour-stat-total-sessions" label={t('SuperAdminDashboard.totalSessions')} value={sessions.length} icon={CalendarClock} tone="primary" />
      </PwaStatScrollRow>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>
          <Users2 size={16} aria-hidden="true" /> {t('SuperAdminDashboard.teamCompositionCardTitle')}
        </h3>
        <RoleBreakdownChart data={roleBreakdown} emptyText={t('SuperAdminDashboard.noUsersYet')} />
      </Card>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('SuperAdminDashboard.statusBreakdownCardTitle', { count: sessions.length })}</h3>
        <SessionStatusDonut counts={statusCounts} emptyText={t('SuperAdminDashboard.noSessionsYet')} />
      </Card>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('SuperAdminDashboard.sessionVolumeCardTitle')}</h3>
        <WeeklySessionsChart data={weeklyVolume} />
      </Card>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>
          <Users2 size={16} aria-hidden="true" /> {t('SuperAdminDashboard.utilizationCardTitle')}
        </h3>
        <InstructorUtilizationList data={instructorUtilization} emptyText={t('SuperAdminDashboard.noAssignmentsYet')} />
      </Card>

      <Card className={bentoStyles.span6}>
        <h3 className={styles.cardTitle}>{t('SuperAdminDashboard.upcomingSessionsCardTitle')}</h3>
        <AdminSessionTimeline sessions={upcoming} emptyText={t('SuperAdminDashboard.noUpcoming')} />
      </Card>

      <Card className={bentoStyles.span6}>
        <h3 className={styles.cardTitle}>{t('SuperAdminDashboard.quickLinksCardTitle')}</h3>
        <PwaStatScrollRow wide>
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={quickLinkStyles.quickLink}>
              <Card id={link.id} interactive className={quickLinkStyles.quickLinkCard}>
                <span className={cn(quickLinkStyles.quickLinkIcon, quickLinkStyles[link.tone])}>
                  <link.icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className={quickLinkStyles.quickLinkTitle}>{link.label}</p>
                  <p className={quickLinkStyles.quickLinkDescription}>{link.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </PwaStatScrollRow>
      </Card>
    </BentoGrid>
  );
}
