import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta } from '@/shared/utils/statusMeta';
import { paths } from '@/routes/paths';
import type { AdminSessionOverview } from '@/shared/types/domain';
import { useAdminSessionsOverview } from '../hooks/useAdminSessionsOverview';

const getSessionId = (session: AdminSessionOverview) => session.id;

export function SuperAdminSessionsPage() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const sessionsQuery = useAdminSessionsOverview();

  const columns = useMemo<TableColumn<AdminSessionOverview>[]>(
    () => [
      { key: 'training', header: t('SuperAdminSessionsPage.columnTraining'), render: (session) => session.trainingName },
      { key: 'client', header: t('SuperAdminSessionsPage.columnClient'), render: (session) => session.clientCompanyName },
      {
        key: 'instructor',
        header: t('SuperAdminSessionsPage.columnInstructor'),
        render: (session) => session.instructorName ?? t('SuperAdminSessionsPage.unassigned'),
      },
      {
        key: 'creator',
        header: t('SuperAdminSessionsPage.columnBookedBy'),
        render: (session) => session.creatorName ?? '—',
      },
      { key: 'startDate', header: t('SuperAdminSessionsPage.columnStarts'), render: (session) => formatDateTime(session.startDate) },
      {
        key: 'status',
        header: t('SuperAdminSessionsPage.columnStatus'),
        render: (session) => (
          <Badge tone={sessionStatusMeta[session.sessionStatus].tone} pulse={sessionStatusMeta[session.sessionStatus].pulse}>
            {t(sessionStatusMeta[session.sessionStatus].labelKey)}
          </Badge>
        ),
      },
      {
        key: 'assignment',
        header: t('SuperAdminSessionsPage.columnAssignment'),
        render: (session) => (
          <Badge
            tone={assignmentStatusMeta[session.assignmentStatus].tone}
            pulse={assignmentStatusMeta[session.assignmentStatus].pulse}
          >
            {t(assignmentStatusMeta[session.assignmentStatus].labelKey)}
          </Badge>
        ),
      },
      {
        key: 'attendees',
        header: t('SuperAdminSessionsPage.columnAttendees'),
        align: 'right',
        render: (session) =>
          t('SuperAdminSessionsPage.attendeesSurveyed', { submitted: session.attendeeSurveysSubmitted, total: session.attendeeCount }),
      },
      {
        key: 'report',
        header: t('SuperAdminSessionsPage.columnReport'),
        render: (session) => (
          <Badge tone={session.hasReport ? 'success' : 'neutral'}>
            {session.hasReport ? t('SuperAdminSessionsPage.reportReady') : t('SuperAdminSessionsPage.reportNotYet')}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <div>
      <div id="tour-sessionsoverview-header">
        <PageHeader title={t('SuperAdminSessionsPage.title')} description={t('SuperAdminSessionsPage.description')} />
      </div>

      <div id="tour-sessionsoverview-table">
        {sessionsQuery.isError ? (
          <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />
        ) : (
          <Table
            columns={columns}
            data={sessionsQuery.data ?? []}
            keyExtractor={getSessionId}
            isLoading={sessionsQuery.isPending}
            onRowClick={(session) => navigate(paths.sessionDetail(session.id))}
            emptyTitle={t('SuperAdminSessionsPage.emptyTitle')}
          />
        )}
      </div>
    </div>
  );
}
