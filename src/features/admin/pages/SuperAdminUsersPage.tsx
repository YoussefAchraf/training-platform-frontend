import { useCallback, useMemo, useState } from 'react';
import { Pencil, UserX } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Table } from '@/shared/components/Table';
import type { TableColumn } from '@/shared/components/Table';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { roleMeta, userStatusMeta } from '@/shared/utils/statusMeta';
import { roleNameOf, type User } from '@/shared/types/domain';
import { useAdminUsers, useDeactivateUser } from '../hooks/useAdminUsers';
import { EditUserModal } from '../components/EditUserModal';
import styles from './SuperAdminUsersPage.module.css';

const getUserId = (user: User) => user.id;

export function SuperAdminUsersPage() {
  const usersQuery = useAdminUsers();
  const deactivateUser = useDeactivateUser();
  const toast = useToast();
  const [editing, setEditing] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState<User | null>(null);
  const deactivateDialog = useDisclosure();

  const handleEdit = useCallback((user: User) => setEditing(user), []);
  const handleCloseEdit = useCallback(() => setEditing(null), []);

  const openDeactivate = useCallback(
    (user: User) => {
      setDeactivating(user);
      deactivateDialog.open();
    },
    [deactivateDialog],
  );

  const handleDeactivateConfirm = useCallback(() => {
    if (!deactivating) return;
    deactivateUser.mutate(deactivating.id, {
      onSuccess: () => {
        toast.success(`${deactivating.firstname} ${deactivating.lastname} was deactivated.`);
        deactivateDialog.close();
        setDeactivating(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deactivating, deactivateUser, toast, deactivateDialog]);

  const columns = useMemo<TableColumn<User>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (user) => (
          <span>
            {user.firstname} {user.lastname}
          </span>
        ),
      },
      { key: 'email', header: 'Email', render: (user) => user.email },
      {
        key: 'role',
        header: 'Role',
        render: (user) => {
          const role = roleNameOf(user)!;
          return <Badge tone={roleMeta[role].tone}>{roleMeta[role].label}</Badge>;
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (user) => <Badge tone={userStatusMeta[user.status].tone}>{userStatusMeta[user.status].label}</Badge>,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (user) => (
          <span className={styles.actions}>
            <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => handleEdit(user)}>
              Edit
            </Button>
            {user.status !== 'deactivated' && (
              <Button
                size="sm"
                variant="danger"
                leftIcon={<UserX size={14} />}
                onClick={() => openDeactivate(user)}
              >
                Deactivate
              </Button>
            )}
          </span>
        ),
      },
    ],
    [handleEdit, openDeactivate],
  );

  return (
    <div>
      <PageHeader title="Users" description="Every account on the platform, across every role." />

      {usersQuery.isError ? (
        <ErrorBanner error={usersQuery.error} onRetry={() => usersQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={usersQuery.data ?? []}
          keyExtractor={getUserId}
          isLoading={usersQuery.isPending}
          emptyTitle="No users yet"
        />
      )}

      <EditUserModal user={editing} onClose={handleCloseEdit} />

      <ConfirmDialog
        isOpen={deactivateDialog.isOpen}
        onClose={deactivateDialog.close}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate this account?"
        description={
          deactivating
            ? `${deactivating.firstname} ${deactivating.lastname} will no longer be able to sign in.`
            : undefined
        }
        confirmLabel="Deactivate"
        tone="danger"
        isLoading={deactivateUser.isPending}
      />
    </div>
  );
}
