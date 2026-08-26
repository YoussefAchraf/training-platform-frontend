import { useCallback, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { Select } from '@/shared/components/Select';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProviders } from '@/features/providers/hooks/useProviders';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import type { Training } from '@/shared/types/domain';
import { useDeleteTraining, useTrainings } from '../hooks/useTrainings';
import { TrainingFormModal } from '../components/TrainingFormModal';
import styles from './TrainingsPage.module.css';

const getTrainingId = (training: Training) => training.id;

export function TrainingsPage() {
  const { user, canManageCatalog, isSuperAdmin } = useAuth();
  const [providerFilter, setProviderFilter] = useState<string>('');
  const providersQuery = useProviders();
  const trainingsQuery = useTrainings(providerFilter ? Number(providerFilter) : undefined);
  const deleteTraining = useDeleteTraining();
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Training | null>(null);
  const [deleting, setDeleting] = useState<Training | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    modal.open();
  }, [modal]);

  const openEdit = useCallback(
    (training: Training) => {
      setEditing(training);
      modal.open();
    },
    [modal],
  );

  const openDelete = useCallback(
    (training: Training) => {
      setDeleting(training);
      deleteDialog.open();
    },
    [deleteDialog],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleting) return;
    deleteTraining.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`${deleting.name} was deleted.`);
        deleteDialog.close();
        setDeleting(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deleting, deleteTraining, toast, deleteDialog]);

  const columns = useMemo<TableColumn<Training>[]>(
    () => [
      { key: 'name', header: 'Name', render: (training) => training.name },
      {
        key: 'providerName',
        header: 'Provider',
        render: (training) => <Badge tone="neutral">{training.providerName}</Badge>,
      },
      {
        key: 'duration',
        header: 'Duration',
        render: (training) => {
          if (!training.duration || !training.durationUnit) return training.duration ? `${training.duration}` : '—';
          const unitLabel = training.durationUnit === 'days' ? 'day' : 'hour';
          return `${training.duration} ${unitLabel}${training.duration === 1 ? '' : 's'}`;
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (training) => {
          const canEdit = isSuperAdmin || training.createdBy === user?.id;
          if (!canEdit) {
            return canManageCatalog ? (
              <span className={styles.notOwned}>Created by {training.creatorName ?? 'another user'}</span>
            ) : null;
          }
          return (
            <span className={styles.actions}>
              <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(training)}>
                Edit
              </Button>
              <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={() => openDelete(training)}>
                Delete
              </Button>
            </span>
          );
        },
      },
    ],
    [isSuperAdmin, user?.id, canManageCatalog, openEdit, openDelete],
  );

  return (
    <div>
      <PageHeader
        title="Trainings"
        description="Certification courses offered under each provider, e.g. RHCSA under Red Hat."
        actions={
          canManageCatalog && (
            <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
              Add training
            </Button>
          )
        }
      />

      <div className={styles.filterRow}>
        <Select
          value={providerFilter}
          onChange={(event) => setProviderFilter(event.target.value)}
          aria-label="Filter by provider"
        >
          <option value="">All providers</option>
          {providersQuery.data?.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </Select>
      </div>

      {trainingsQuery.isError ? (
        <ErrorBanner error={trainingsQuery.error} onRetry={() => trainingsQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={trainingsQuery.data ?? []}
          keyExtractor={getTrainingId}
          isLoading={trainingsQuery.isPending}
          emptyTitle="No trainings yet"
          emptyDescription={
            canManageCatalog ? 'Add a training to a provider to start booking sessions.' : undefined
          }
          emptyAction={
            canManageCatalog && (
              <Button size="sm" onClick={openCreate}>
                Add training
              </Button>
            )
          }
        />
      )}

      <TrainingFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        defaultProviderId={providerFilter ? Number(providerFilter) : undefined}
        editing={editing}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        title="Delete this training?"
        description={deleting ? `"${deleting.name}" will be removed from the catalog.` : undefined}
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteTraining.isPending}
      />
    </div>
  );
}
