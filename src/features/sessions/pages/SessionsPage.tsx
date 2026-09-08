import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { ViewToggle } from '@/shared/components/ViewToggle';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta } from '@/shared/utils/statusMeta';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { paths } from '@/routes/paths';
import type { TrainingSession } from '@/shared/types/domain';
import { useSessions } from '../hooks/useSessions';
import { useSessionLookups } from '../hooks/useSessionLookups';
import { SessionFormModal } from '../components/SessionFormModal';
import { SessionCardGrid } from '../components/SessionCardGrid';
import { SessionsFilterToolbar } from '../components/SessionsFilterToolbar';
import { defaultSessionFilters, filterSessions, hasActiveSessionFilters, type SessionFilters } from '../utils/sessionFilters';

const getSessionId = (session: TrainingSession) => session.id;

type ViewMode = 'cards' | 'table';

export function SessionsPage() {
  const { t } = useTranslation('sessions');
  const { canManageCatalog, isInstructor } = useAuth();
  const navigate = useNavigate();
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap, instructors } = useSessionLookups();
  const modal = useDisclosure();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filters, setFilters] = useState<SessionFilters>(defaultSessionFilters);

  const filteredSessions = useMemo(
    () => filterSessions(sessionsQuery.data ?? [], filters, { trainingMap, clientMap, instructorMap }),
    [sessionsQuery.data, filters, trainingMap, clientMap, instructorMap],
  );
  const filtersActive = hasActiveSessionFilters(filters);

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
        render: (session) => {
          const client = clientMap.get(session.clientId);
          return (
            <span>
              <CountryFlag code={client?.country} /> {client?.companyName ?? `#${session.clientId}`}
            </span>
          );
        },
      },
      {
        key: 'locationType',
        header: t('SessionsPage.columnLocation'),
        render: (session) => (
          <Badge tone={session.locationType === 'remote' ? 'info' : 'neutral'}>
            {t(`SessionsPage.${session.locationType}`)}
          </Badge>
        ),
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
        // "Accepted" isn't shown - assignment is automatic, so the only
        // states worth flagging here are ones that actually need attention.
        render: (session) =>
          session.assignmentStatus === 'accepted' ? null : (
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

  const emptyTitle = filtersActive
    ? t('SessionsPage.emptyTitleFiltered')
    : isInstructor
      ? t('SessionsPage.emptyTitleInstructor')
      : t('SessionsPage.emptyTitleOther');
  const emptyDescription = filtersActive
    ? t('SessionsPage.emptyDescriptionFiltered')
    : canManageCatalog
      ? t('SessionsPage.emptyDescription')
      : undefined;
  const emptyAction = filtersActive ? (
    <Button size="sm" variant="outline" onClick={() => setFilters(defaultSessionFilters)}>
      {t('SessionsFilterToolbar.clearFilters')}
    </Button>
  ) : (
    canManageCatalog && (
      <Button size="sm" onClick={modal.open}>
        {t('SessionsPage.bookSession')}
      </Button>
    )
  );

  return (
    <div>
      <div id="tour-sessions-header">
        <PageHeader
          title={t('SessionsPage.title')}
          description={
            isInstructor
              ? t('SessionsPage.descriptionInstructor')
              : t('SessionsPage.descriptionOther')
          }
          actions={
            <>
              <ViewToggle
                id="tour-sessions-view-toggle"
                aria-label={t('SessionsPage.viewToggleLabel')}
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'cards', label: <><LayoutGrid size={14} /> {t('SessionsPage.viewCards')}</> },
                  { value: 'table', label: <><List size={14} /> {t('SessionsPage.viewTable')}</> },
                ]}
              />
              {canManageCatalog && (
                <Button id="tour-sessions-add" leftIcon={<Plus size={16} />} onClick={modal.open}>
                  {t('SessionsPage.bookSession')}
                </Button>
              )}
            </>
          }
        />
      </div>

      <SessionsFilterToolbar filters={filters} onChange={setFilters} instructors={instructors} showInstructorFilter={!isInstructor} />

      <div id="tour-sessions-table">
        {sessionsQuery.isError ? (
          <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />
        ) : viewMode === 'cards' ? (
          <SessionCardGrid
            sessions={filteredSessions}
            trainingMap={trainingMap}
            clientMap={clientMap}
            instructorMap={instructorMap}
            showInstructor={!isInstructor}
            onCardClick={handleRowClick}
            isLoading={sessionsQuery.isPending}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={emptyAction}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredSessions}
            keyExtractor={getSessionId}
            isLoading={sessionsQuery.isPending}
            onRowClick={handleRowClick}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={emptyAction}
          />
        )}
      </div>

      <SessionFormModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}
