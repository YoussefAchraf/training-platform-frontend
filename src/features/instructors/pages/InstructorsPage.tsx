import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import type { Instructor } from '@/shared/types/domain';
import { useInstructors } from '../hooks/useInstructors';
import { EditInstructorModal } from '../components/EditInstructorModal';
import { InstructorCardGrid } from '../components/InstructorCardGrid';
import { InstructorsFilterToolbar } from '../components/InstructorsFilterToolbar';
import { defaultInstructorFilters, filterInstructors, hasActiveInstructorFilters, type InstructorFilters } from '../utils/instructorFilters';

export function InstructorsPage() {
  const { t } = useTranslation('instructors');
  const { isManager, isSuperAdmin } = useAuth();
  const canEdit = isManager || isSuperAdmin;
  const instructorsQuery = useInstructors();
  const trainingsQuery = useTrainings();
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [filters, setFilters] = useState<InstructorFilters>(defaultInstructorFilters);

  const handleEdit = useCallback((instructor: Instructor) => setEditing(instructor), []);
  const handleCloseEdit = useCallback(() => setEditing(null), []);

  const filteredInstructors = useMemo(
    () => filterInstructors(instructorsQuery.data ?? [], filters),
    [instructorsQuery.data, filters],
  );
  const filtersActive = hasActiveInstructorFilters(filters);

  const emptyTitle = filtersActive ? t('InstructorsPage.emptyTitleFiltered') : t('InstructorsPage.emptyTitle');
  const emptyDescription = filtersActive ? t('InstructorsPage.emptyDescriptionFiltered') : t('InstructorsPage.emptyDescription');
  const emptyAction = filtersActive && (
    <Button size="sm" variant="outline" onClick={() => setFilters(defaultInstructorFilters)}>
      {t('InstructorsFilterToolbar.clearFilters')}
    </Button>
  );

  return (
    <div>
      <div id="tour-instructors-header">
        <PageHeader title={t('InstructorsPage.title')} description={t('InstructorsPage.description')} />
      </div>

      <InstructorsFilterToolbar filters={filters} onChange={setFilters} trainings={trainingsQuery.data ?? []} />

      <div id="tour-instructors-table">
        {instructorsQuery.isError ? (
          <ErrorBanner error={instructorsQuery.error} onRetry={() => instructorsQuery.refetch()} />
        ) : (
          <InstructorCardGrid
            instructors={filteredInstructors}
            canEdit={canEdit}
            onEdit={handleEdit}
            isLoading={instructorsQuery.isPending}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={emptyAction}
          />
        )}
      </div>

      <EditInstructorModal instructor={editing} onClose={handleCloseEdit} />
    </div>
  );
}
