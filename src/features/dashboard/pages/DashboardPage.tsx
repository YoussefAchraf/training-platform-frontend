import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { SalesDashboard } from '../components/SalesDashboard';
import { InstructorDashboard } from '../components/InstructorDashboard';
import { SuperAdminDashboard } from '../components/SuperAdminDashboard';

export function DashboardPage() {
  const { user, isManager, isInstructor, isSuperAdmin } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.firstname ?? ''}`}
        description={
          isSuperAdmin
            ? 'Platform-wide oversight: users, sessions, and the audit trail.'
            : isManager
              ? 'Here is what needs your attention across the company.'
              : isInstructor
                ? 'Your upcoming sessions and pending responses.'
                : 'Your training delivery pipeline at a glance.'
        }
      />

      {isSuperAdmin ? (
        <SuperAdminDashboard />
      ) : isManager ? (
        <ManagerDashboard />
      ) : isInstructor ? (
        <InstructorDashboard />
      ) : (
        <SalesDashboard />
      )}
    </div>
  );
}
