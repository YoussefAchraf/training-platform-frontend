import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const sessionsQuery = useAdminSessionsOverview();

  const columns = useMemo<TableColumn<AdminSessionOverview>[]>(
    () => [
      { key: 'training', header: 'Training', render: (session) => session.trainingName },
      { key: 'client', header: 'Client', render: (session) => session.clientCompanyName },
      {
        key: 'instructor',
        header: 'Instructor',
        render: (session) => session.instructorName ?? 'Unassigned',
      },
      {
        key: 'creator',
        header: 'Booked by',
        render: (session) => session.creatorName ?? '—',
      },
      { key: 'startDate', header: 'Starts', render: (session) => formatDateTime(session.startDate) },
      {
        key: 'status',
        header: 'Status',
        render: (session) => (
          <Badge tone={sessionStatusMeta[session.sessionStatus].tone} pulse={sessionStatusMeta[session.sessionStatus].pulse}>
            {sessionStatusMeta[session.sessionStatus].label}
          </Badge>
        ),
      },
      {
        key: 'assignment',
        header: 'Assignment',
        render: (session) => (
          <Badge
            tone={assignmentStatusMeta[session.assignmentStatus].tone}
            pulse={assignmentStatusMeta[session.assignmentStatus].pulse}
          >
            {assignmentStatusMeta[session.assignmentStatus].label}
          </Badge>
        ),
      },
      {
        key: 'attendees',
        header: 'Attendees',
        align: 'right',
        render: (session) => `${session.attendeeSurveysSubmitted}/${session.attendeeCount} surveyed`,
      },
      {
        key: 'report',
        header: 'Report',
        render: (session) => (
          <Badge tone={session.hasReport ? 'success' : 'neutral'}>{session.hasReport ? 'Ready' : 'Not yet'}</Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Sessions overview" description="Every training session booked across the company." />

      {sessionsQuery.isError ? (
        <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={sessionsQuery.data ?? []}
          keyExtractor={getSessionId}
          isLoading={sessionsQuery.isPending}
          onRowClick={(session) => navigate(paths.sessionDetail(session.id))}
          emptyTitle="No sessions yet"
        />
      )}
    </div>
  );
}
