import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDashboardTour } from '@/features/tour/useDashboardTour';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { SalesDashboard } from '../components/SalesDashboard';
import { InstructorDashboard } from '../components/InstructorDashboard';
import { SuperAdminDashboard } from '../components/SuperAdminDashboard';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { user, isManager, isInstructor, isSuperAdmin } = useAuth();
  useDashboardTour();

  return (
    <div>
      <PageHeader
        title={t('DashboardPage.welcomeBack', { name: user?.firstname ?? '' })}
        description={
          isSuperAdmin
            ? t('DashboardPage.descriptionSuperAdmin')
            : isManager
              ? t('DashboardPage.descriptionManager')
              : isInstructor
                ? t('DashboardPage.descriptionInstructor')
                : t('DashboardPage.descriptionSales')
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
