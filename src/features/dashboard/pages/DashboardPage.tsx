import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { Spinner } from '@/shared/components/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { useDashboardTour } from '@/features/tour/useDashboardTour';
import { useAutoGreeting } from '@/features/chatbot/hooks/useAutoGreeting';





const ManagerDashboard = lazy(() => import('../components/ManagerDashboard').then((m) => ({ default: m.ManagerDashboard })));
const SalesDashboard = lazy(() => import('../components/SalesDashboard').then((m) => ({ default: m.SalesDashboard })));
const InstructorDashboard = lazy(() =>
  import('../components/InstructorDashboard').then((m) => ({ default: m.InstructorDashboard })),
);
const SuperAdminDashboard = lazy(() =>
  import('../components/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard })),
);







const PwaManagerDashboard = lazy(() => import('@/pwa/components/PwaManagerDashboard').then((m) => ({ default: m.PwaManagerDashboard })));
const PwaSalesDashboard = lazy(() => import('@/pwa/components/PwaSalesDashboard').then((m) => ({ default: m.PwaSalesDashboard })));
const PwaInstructorDashboard = lazy(() =>
  import('@/pwa/components/PwaInstructorDashboard').then((m) => ({ default: m.PwaInstructorDashboard })),
);
const PwaSuperAdminDashboard = lazy(() =>
  import('@/pwa/components/PwaSuperAdminDashboard').then((m) => ({ default: m.PwaSuperAdminDashboard })),
);

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { user, isManager, isInstructor, isSuperAdmin } = useAuth();
  const isPwaPhone = useStandaloneDeviceClass() === 'phone';
  useDashboardTour();
  useAutoGreeting();

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

      <Suspense fallback={<Spinner />}>
        {isPwaPhone ? (
          isSuperAdmin ? (
            <PwaSuperAdminDashboard />
          ) : isManager ? (
            <PwaManagerDashboard />
          ) : isInstructor ? (
            <PwaInstructorDashboard />
          ) : (
            <PwaSalesDashboard />
          )
        ) : isSuperAdmin ? (
          <SuperAdminDashboard />
        ) : isManager ? (
          <ManagerDashboard />
        ) : isInstructor ? (
          <InstructorDashboard />
        ) : (
          <SalesDashboard />
        )}
      </Suspense>
    </div>
  );
}
