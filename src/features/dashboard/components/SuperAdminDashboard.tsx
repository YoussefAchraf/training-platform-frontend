import { Link } from 'react-router-dom';
import { CalendarClock, History, ShieldAlert, UserCog, Users2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { paths } from '@/routes/paths';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { useAdminSessionsOverview } from '@/features/admin/hooks/useAdminSessionsOverview';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { StatTileGrid } from './StatTileGrid';
import quickLinkStyles from './SuperAdminDashboard.module.css';

export function SuperAdminDashboard() {
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
  const deactivatedCount = users.filter((user) => user.status === 'deactivated').length;

  const quickLinks = [
    { to: paths.superAdminUsers, icon: UserCog, label: 'Manage users', description: 'Edit roles, status, and details' },
    { to: paths.superAdminSessions, icon: CalendarClock, label: 'Sessions overview', description: 'Every session, company-wide' },
    { to: paths.auditLog, icon: History, label: 'Audit log', description: 'Every create, update, delete, cancel' },
  ];

  return (
    <div>
      <StatTileGrid>
        <StatTile label="Total users" value={users.length} icon={Users2} tone="primary" />
        <StatTile label="Pending signups" value={pendingCount} icon={ShieldAlert} />
        <StatTile label="Deactivated" value={deactivatedCount} icon={UserCog} />
        <StatTile label="Total sessions" value={sessions.length} icon={CalendarClock} />
      </StatTileGrid>

      <div className={quickLinkStyles.grid}>
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to} className={quickLinkStyles.quickLink}>
            <Card interactive className={quickLinkStyles.quickLinkCard}>
              <span className={quickLinkStyles.quickLinkIcon}>
                <link.icon size={20} />
              </span>
              <div>
                <p className={quickLinkStyles.quickLinkTitle}>{link.label}</p>
                <p className={quickLinkStyles.quickLinkDescription}>{link.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
