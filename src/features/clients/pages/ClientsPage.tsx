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
import type { Client } from '@/shared/types/domain';
import { useClients, useDeleteClient } from '../hooks/useClients';
import { ClientFormModal } from '../components/ClientFormModal';
import styles from './ClientsPage.module.css';

const getClientId = (client: Client) => client.id;

export function ClientsPage() {
  const { t } = useTranslation('clients');
  const { user, canManageCatalog, isSuperAdmin } = useAuth();
  const clientsQuery = useClients();
  const deleteClient = useDeleteClient();
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    modal.open();
  }, [modal]);

  const openEdit = useCallback(
    (client: Client) => {
      setEditing(client);
      modal.open();
    },
    [modal],
  );

  const openDelete = useCallback(
    (client: Client) => {
      setDeleting(client);
      deleteDialog.open();
    },
    [deleteDialog],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleting) return;
    deleteClient.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t('ClientsPage.clientDeleted', { name: deleting.companyName }));
        deleteDialog.close();
        setDeleting(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deleting, deleteClient, toast, deleteDialog, t]);

  const columns = useMemo<TableColumn<Client>[]>(
    () => [
      { key: 'companyName', header: t('ClientsPage.columnCompany'), render: (client) => client.companyName },
      { key: 'email', header: t('ClientsPage.columnEmail'), render: (client) => client.email || '—' },
      { key: 'phone', header: t('ClientsPage.columnPhone'), render: (client) => client.phone || '—' },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (client) => {
          const canEdit = isSuperAdmin || client.createdBy === user?.id;
          if (!canEdit) {
            return canManageCatalog ? (
              <span className={styles.notOwned}>{t('ClientsPage.createdBy', { name: client.creatorName ?? t('ClientsPage.anotherUser') })}</span>
            ) : null;
          }
          return (
            <span className={styles.actions}>
              <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(client)}>
                {t('ClientsPage.edit')}
              </Button>
              <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={() => openDelete(client)}>
                {t('ClientsPage.delete')}
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
      <div id="tour-clients-header">
        <PageHeader
          title={t('ClientsPage.title')}
          description={t('ClientsPage.description')}
          actions={
            canManageCatalog && (
              <Button id="tour-clients-add" leftIcon={<Plus size={16} />} onClick={openCreate}>
                {t('ClientsPage.addClient')}
              </Button>
            )
          }
        />
      </div>

      <div id="tour-clients-table">
        {clientsQuery.isError ? (
          <ErrorBanner error={clientsQuery.error} onRetry={() => clientsQuery.refetch()} />
        ) : (
          <Table
            columns={columns}
            data={clientsQuery.data ?? []}
            keyExtractor={getClientId}
            isLoading={clientsQuery.isPending}
            emptyTitle={t('ClientsPage.emptyTitle')}
            emptyDescription={canManageCatalog ? t('ClientsPage.emptyDescription') : undefined}
            emptyAction={
              canManageCatalog && (
                <Button size="sm" onClick={openCreate}>
                  {t('ClientsPage.addClient')}
                </Button>
              )
            }
          />
        )}
      </div>

      <ClientFormModal isOpen={modal.isOpen} onClose={modal.close} editing={editing} />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        title={t('ClientsPage.deleteDialogTitle')}
        description={deleting ? t('ClientsPage.deleteDialogDescription', { name: deleting.companyName }) : undefined}
        confirmLabel={t('ClientsPage.delete')}
        tone="danger"
        isLoading={deleteClient.isPending}
      />
    </div>
  );
}
