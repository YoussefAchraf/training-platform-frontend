import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { formatDate } from '@/shared/utils/formatDate';
import { ProviderLogo } from '@/shared/components/ProviderLogo';
import type { Provider } from '@/shared/types/domain';
import { useDeleteProvider, useProviders } from '../hooks/useProviders';
import { ProviderFormModal } from '../components/ProviderFormModal';
import styles from './ProvidersPage.module.css';

const getProviderId = (provider: Provider) => provider.id;

export function ProvidersPage() {
  const { t } = useTranslation('providers');
  const { user, canManageCatalog, isSuperAdmin } = useAuth();
  const providersQuery = useProviders();
  const deleteProvider = useDeleteProvider();
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Provider | null>(null);
  const [deleting, setDeleting] = useState<Provider | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    modal.open();
  }, [modal]);

  const openEdit = useCallback(
    (provider: Provider) => {
      setEditing(provider);
      modal.open();
    },
    [modal],
  );

  const openDelete = useCallback(
    (provider: Provider) => {
      setDeleting(provider);
      deleteDialog.open();
    },
    [deleteDialog],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleting) return;
    deleteProvider.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t('ProvidersPage.providerDeleted', { name: deleting.name }));
        deleteDialog.close();
        setDeleting(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deleting, deleteProvider, toast, deleteDialog, t]);

  const columns = useMemo<TableColumn<Provider>[]>(
    () => [
      {
        key: 'name',
        header: t('ProvidersPage.columnName'),
        render: (provider) => (
          <span className={styles.nameCell}>
            <ProviderLogo name={provider.name} logoUrl={provider.logoUrl} size={32} />
            {provider.name}
          </span>
        ),
      },
      {
        key: 'description',
        header: t('ProvidersPage.columnDescription'),
        render: (provider) => provider.description || '—',
      },
      {
        key: 'createdAt',
        header: t('ProvidersPage.columnAdded'),
        render: (provider) => formatDate(provider.createdAt),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (provider) => {
          const canEdit = isSuperAdmin || provider.createdBy === user?.id;
          if (!canEdit) {
            return canManageCatalog ? (
              <span className={styles.notOwned}>{t('ProvidersPage.createdBy', { name: provider.creatorName ?? t('ProvidersPage.anotherUser') })}</span>
            ) : null;
          }
          return (
            <span className={styles.actions}>
              <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(provider)}>
                {t('ProvidersPage.edit')}
              </Button>
              <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={() => openDelete(provider)}>
                {t('ProvidersPage.delete')}
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
      <div id="tour-providers-header">
        <PageHeader
          title={t('ProvidersPage.title')}
          description={t('ProvidersPage.description')}
          actions={
            canManageCatalog && (
              <Button id="tour-providers-add" leftIcon={<Plus size={16} />} onClick={openCreate}>
                {t('ProvidersPage.addProvider')}
              </Button>
            )
          }
        />
      </div>

      <div id="tour-providers-table">
        {providersQuery.isError ? (
          <ErrorBanner error={providersQuery.error} onRetry={() => providersQuery.refetch()} />
        ) : (
          <Table
            columns={columns}
            data={providersQuery.data ?? []}
            keyExtractor={getProviderId}
            isLoading={providersQuery.isPending}
            emptyTitle={t('ProvidersPage.emptyTitle')}
            emptyDescription={
              canManageCatalog ? t('ProvidersPage.emptyDescription') : undefined
            }
            emptyAction={
              canManageCatalog && (
                <Button size="sm" onClick={openCreate}>
                  {t('ProvidersPage.addProvider')}
                </Button>
              )
            }
          />
        )}
      </div>

      <ProviderFormModal isOpen={modal.isOpen} onClose={modal.close} editing={editing} />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        title={t('ProvidersPage.deleteDialogTitle')}
        description={deleting ? t('ProvidersPage.deleteDialogDescription', { name: deleting.name }) : undefined}
        confirmLabel={t('ProvidersPage.delete')}
        tone="danger"
        isLoading={deleteProvider.isPending}
      />
    </div>
  );
}
