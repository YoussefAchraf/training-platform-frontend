import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta } from '@/shared/utils/statusMeta';
import { paths } from '@/routes/paths';
import type { TrainingSession } from '@/shared/types/domain';
import { useSessions } from '../hooks/useSessions';
import { useSessionLookups } from '../hooks/useSessionLookups';
import { SessionFormModal } from '../components/SessionFormModal';

const getSessionId = (session: TrainingSession) => session.id;

export function SessionsPage() {
  const { canManageCatalog, isInstructor } = useAuth();
  const navigate = useNavigate();
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();
  const modal = useDisclosure();

  const columns = useMemo<TableColumn<TrainingSession>[]>(
    () => [
      {
        key: 'training',
        header: 'Training',
        render: (session) => trainingMap.get(session.trainingId)?.name ?? `#${session.trainingId}`,
      },
      {
        key: 'client',
        header: 'Client',
        render: (session) => clientMap.get(session.clientId)?.companyName ?? `#${session.clientId}`,
      },
      ...(!isInstructor
        ? [
            {
              key: 'instructor',
              header: 'Instructor',
              render: (session: TrainingSession) => {
                const instructor = session.instructorId ? instructorMap.get(session.instructorId) : undefined;
                return instructor ? `${instructor.firstname} ${instructor.lastname}` : 'Unassigned';
              },
            } satisfies TableColumn<TrainingSession>,
          ]
        : []),
      {
        key: 'startDate',
        header: 'Starts',
        render: (session) => formatDateTime(session.startDate),
      },
      {
        key: 'status',
        header: 'Status',
        render: (session) => (
          <Badge
            tone={sessionStatusMeta[session.sessionStatus].tone}
            pulse={sessionStatusMeta[session.sessionStatus].pulse}
          >
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
    ],
    [isInstructor, trainingMap, clientMap, instructorMap],
  );

  const handleRowClick = useCallback(
    (session: TrainingSession) => navigate(paths.sessionDetail(session.id)),
    [navigate],
  );

  return (
    <div>
      <PageHeader
        title="Sessions"
        description={
          isInstructor
            ? 'Training sessions assigned to you.'
            : 'Training sessions booked for clients.'
        }
        actions={
          canManageCatalog && (
            <Button leftIcon={<Plus size={16} />} onClick={modal.open}>
              Book session
            </Button>
          )
        }
      />

      {sessionsQuery.isError ? (
        <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={sessionsQuery.data ?? []}
          keyExtractor={getSessionId}
          isLoading={sessionsQuery.isPending}
          onRowClick={handleRowClick}
          emptyTitle={isInstructor ? 'No sessions assigned yet' : 'No sessions booked yet'}
          emptyDescription={canManageCatalog ? 'Book a session to get started.' : undefined}
          emptyAction={
            canManageCatalog && (
              <Button size="sm" onClick={modal.open}>
                Book session
              </Button>
            )
          }
        />
      )}

      <SessionFormModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}
