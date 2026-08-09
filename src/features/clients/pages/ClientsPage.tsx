import { useCallback, useMemo, useState } from 'react';
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
        toast.success(`${deleting.companyName} was deleted.`);
        deleteDialog.close();
        setDeleting(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deleting, deleteClient, toast, deleteDialog]);

  const columns = useMemo<TableColumn<Client>[]>(
    () => [
      { key: 'companyName', header: 'Company', render: (client) => client.companyName },
      { key: 'email', header: 'Email', render: (client) => client.email || '—' },
      { key: 'phone', header: 'Phone', render: (client) => client.phone || '—' },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (client) => {
          const canEdit = isSuperAdmin || client.createdBy === user?.id;
          if (!canEdit) {
            return canManageCatalog ? (
              <span className={styles.notOwned}>Created by {client.creatorName ?? 'another user'}</span>
            ) : null;
          }
          return (
            <span className={styles.actions}>
              <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => openEdit(client)}>
                Edit
              </Button>
              <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={() => openDelete(client)}>
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
        title="Clients"
        description="Companies you deliver training sessions for."
        actions={
          canManageCatalog && (
            <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
              Add client
            </Button>
          )
        }
      />

      {clientsQuery.isError ? (
        <ErrorBanner error={clientsQuery.error} onRetry={() => clientsQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={clientsQuery.data ?? []}
          keyExtractor={getClientId}
          isLoading={clientsQuery.isPending}
          emptyTitle="No clients yet"
          emptyDescription={canManageCatalog ? 'Add a client before booking a training session.' : undefined}
          emptyAction={
            canManageCatalog && (
              <Button size="sm" onClick={openCreate}>
                Add client
              </Button>
            )
          }
        />
      )}

      <ClientFormModal isOpen={modal.isOpen} onClose={modal.close} editing={editing} />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        title="Delete this client?"
        description={deleting ? `"${deleting.companyName}" will be removed.` : undefined}
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteClient.isPending}
      />
    </div>
  );
}
