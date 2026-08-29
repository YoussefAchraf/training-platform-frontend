import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Instructor } from '@/shared/types/domain';
import { useInstructors } from '../hooks/useInstructors';
import { EditInstructorModal } from '../components/EditInstructorModal';
import styles from './InstructorsPage.module.css';

const getInstructorId = (instructor: Instructor) => instructor.id;

export function InstructorsPage() {
  const { t } = useTranslation('instructors');
  const { isManager, isSuperAdmin } = useAuth();
  const canEdit = isManager || isSuperAdmin;
  const instructorsQuery = useInstructors();
  const [editing, setEditing] = useState<Instructor | null>(null);

  const handleEdit = useCallback((instructor: Instructor) => setEditing(instructor), []);
  const handleCloseEdit = useCallback(() => setEditing(null), []);

  const columns = useMemo<TableColumn<Instructor>[]>(
    () => [
      {
        key: 'name',
        header: t('InstructorsPage.columnName'),
        render: (instructor) => (
          <span>
            {instructor.firstname} {instructor.lastname}
          </span>
        ),
      },
      { key: 'email', header: t('InstructorsPage.columnEmail'), render: (instructor) => instructor.email },
      {
        key: 'skills',
        header: t('InstructorsPage.columnTrainings'),
        render: (instructor) =>
          instructor.skills.length > 0 ? (
            <span className={styles.skillsList}>
              {instructor.skills.map((skill) => (
                <Badge key={skill.trainingId} tone="info">
                  {skill.trainingName}
                </Badge>
              ))}
            </span>
          ) : (
            '—'
          ),
      },
      ...(canEdit
        ? [
            {
              key: 'actions',
              header: '',
              align: 'right' as const,
              render: (instructor: Instructor) => (
                <Button size="sm" variant="outline" onClick={() => handleEdit(instructor)}>
                  {t('InstructorsPage.edit')}
                </Button>
              ),
            },
          ]
        : []),
    ],
    [canEdit, handleEdit, t],
  );

  return (
    <div>
      <PageHeader title={t('InstructorsPage.title')} description={t('InstructorsPage.description')} />

      {instructorsQuery.isError ? (
        <ErrorBanner error={instructorsQuery.error} onRetry={() => instructorsQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={instructorsQuery.data ?? []}
          keyExtractor={getInstructorId}
          isLoading={instructorsQuery.isPending}
          emptyTitle={t('InstructorsPage.emptyTitle')}
          emptyDescription={t('InstructorsPage.emptyDescription')}
        />
      )}

      <EditInstructorModal instructor={editing} onClose={handleCloseEdit} />
    </div>
  );
}
