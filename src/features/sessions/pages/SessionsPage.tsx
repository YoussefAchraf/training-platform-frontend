import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('sessions');
  const { canManageCatalog, isInstructor } = useAuth();
  const navigate = useNavigate();
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();
  const modal = useDisclosure();

  const columns = useMemo<TableColumn<TrainingSession>[]>(
    () => [
      {
        key: 'training',
        header: t('SessionsPage.columnTraining'),
        render: (session) => trainingMap.get(session.trainingId)?.name ?? `#${session.trainingId}`,
      },
      {
        key: 'client',
        header: t('SessionsPage.columnClient'),
        render: (session) => clientMap.get(session.clientId)?.companyName ?? `#${session.clientId}`,
      },
      ...(!isInstructor
        ? [
            {
              key: 'instructor',
              header: t('SessionsPage.columnInstructor'),
              render: (session: TrainingSession) => {
                const instructor = session.instructorId ? instructorMap.get(session.instructorId) : undefined;
                return instructor ? `${instructor.firstname} ${instructor.lastname}` : t('SessionsPage.unassigned');
              },
            } satisfies TableColumn<TrainingSession>,
          ]
        : []),
      {
        key: 'startDate',
        header: t('SessionsPage.columnStarts'),
        render: (session) => formatDateTime(session.startDate),
      },
      {
        key: 'status',
        header: t('SessionsPage.columnStatus'),
        render: (session) => (
          <Badge
            tone={sessionStatusMeta[session.sessionStatus].tone}
            pulse={sessionStatusMeta[session.sessionStatus].pulse}
          >
            {t(sessionStatusMeta[session.sessionStatus].labelKey)}
          </Badge>
        ),
      },
      {
        key: 'assignment',
        header: t('SessionsPage.columnAssignment'),
        render: (session) => (
          <Badge
            tone={assignmentStatusMeta[session.assignmentStatus].tone}
            pulse={assignmentStatusMeta[session.assignmentStatus].pulse}
          >
            {t(assignmentStatusMeta[session.assignmentStatus].labelKey)}
          </Badge>
        ),
      },
    ],
    [isInstructor, trainingMap, clientMap, instructorMap, t],
  );

  const handleRowClick = useCallback(
    (session: TrainingSession) => navigate(paths.sessionDetail(session.id)),
    [navigate],
  );

  return (
    <div>
      <PageHeader
        title={t('SessionsPage.title')}
        description={
          isInstructor
            ? t('SessionsPage.descriptionInstructor')
            : t('SessionsPage.descriptionOther')
        }
        actions={
          canManageCatalog && (
            <Button leftIcon={<Plus size={16} />} onClick={modal.open}>
              {t('SessionsPage.bookSession')}
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
          emptyTitle={isInstructor ? t('SessionsPage.emptyTitleInstructor') : t('SessionsPage.emptyTitleOther')}
          emptyDescription={canManageCatalog ? t('SessionsPage.emptyDescription') : undefined}
          emptyAction={
            canManageCatalog && (
              <Button size="sm" onClick={modal.open}>
                {t('SessionsPage.bookSession')}
              </Button>
            )
          }
        />
      )}

      <SessionFormModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}
