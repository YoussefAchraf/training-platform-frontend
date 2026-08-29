import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('trainings');
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
        toast.success(t('TrainingsPage.trainingDeleted', { name: deleting.name }));
        deleteDialog.close();
        setDeleting(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deleting, deleteTraining, toast, deleteDialog, t]);

  const columns = useMemo<TableColumn<Training>[]>(
    () => [
      { key: 'name', header: t('TrainingsPage.columnName'), render: (training) => training.name },
      {
        key: 'providerName',
        header: t('TrainingsPage.columnProvider'),
        render: (training) => <Badge tone="neutral">{training.providerName}</Badge>,
      },
      {
        key: 'duration',
        header: t('TrainingsPage.columnDuration'),
        render: (training) => {
          if (!training.duration || !training.durationUnit) return training.duration ? `${training.duration}` : '—';
          const unitLabel =
            training.durationUnit === 'days'
              ? training.duration === 1
                ? t('TrainingsPage.day')
                : t('TrainingsPage.days')
              : training.duration === 1
                ? t('TrainingsPage.hour')
                : t('TrainingsPage.hours');
          return `${training.duration} ${unitLabel}`;
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
              <span className={styles.notOwned}>{t('TrainingsPage.createdBy', { name: training.creatorName ?? t('TrainingsPage.anotherUser') })}</span>
            ) : null;
          }
          return (
            <span className={styles.actions}>
              <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(training)}>
                {t('TrainingsPage.edit')}
              </Button>
              <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={() => openDelete(training)}>
                {t('TrainingsPage.delete')}
              </Button>
            </span>
          );
        },
      },
    ],
    [isSuperAdmin, user?.id, canManageCatalog, openEdit, openDelete, t],
  );

  return (
    <div>
      <div id="tour-trainings-header">
        <PageHeader
          title={t('TrainingsPage.title')}
          description={t('TrainingsPage.description')}
          actions={
            canManageCatalog && (
              <Button id="tour-trainings-add" leftIcon={<Plus size={16} />} onClick={openCreate}>
                {t('TrainingsPage.addTraining')}
              </Button>
            )
          }
        />
      </div>

      <div className={styles.filterRow} id="tour-trainings-filter">
        <Select
          value={providerFilter}
          onChange={(event) => setProviderFilter(event.target.value)}
          aria-label={t('TrainingsPage.filterByProvider')}
        >
          <option value="">{t('TrainingsPage.allProviders')}</option>
          {providersQuery.data?.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </Select>
      </div>

      <div id="tour-trainings-table">
        {trainingsQuery.isError ? (
          <ErrorBanner error={trainingsQuery.error} onRetry={() => trainingsQuery.refetch()} />
        ) : (
          <Table
            columns={columns}
            data={trainingsQuery.data ?? []}
            keyExtractor={getTrainingId}
            isLoading={trainingsQuery.isPending}
            emptyTitle={t('TrainingsPage.emptyTitle')}
            emptyDescription={
              canManageCatalog ? t('TrainingsPage.emptyDescription') : undefined
            }
            emptyAction={
              canManageCatalog && (
                <Button size="sm" onClick={openCreate}>
                  {t('TrainingsPage.addTraining')}
                </Button>
              )
            }
          />
        )}
      </div>

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
        title={t('TrainingsPage.deleteDialogTitle')}
        description={deleting ? t('TrainingsPage.deleteDialogDescription', { name: deleting.name }) : undefined}
        confirmLabel={t('TrainingsPage.delete')}
        tone="danger"
        isLoading={deleteTraining.isPending}
      />
    </div>
  );
}
