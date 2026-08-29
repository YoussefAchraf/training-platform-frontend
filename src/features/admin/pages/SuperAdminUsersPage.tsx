import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('admin');
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
        toast.success(t('SuperAdminUsersPage.userDeactivated', { name: `${deactivating.firstname} ${deactivating.lastname}` }));
        deactivateDialog.close();
        setDeactivating(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deactivating, deactivateUser, toast, deactivateDialog, t]);

  const columns = useMemo<TableColumn<User>[]>(
    () => [
      {
        key: 'name',
        header: t('SuperAdminUsersPage.columnName'),
        render: (user) => (
          <span>
            {user.firstname} {user.lastname}
          </span>
        ),
      },
      { key: 'email', header: t('SuperAdminUsersPage.columnEmail'), render: (user) => user.email },
      {
        key: 'role',
        header: t('SuperAdminUsersPage.columnRole'),
        render: (user) => {
          const role = roleNameOf(user)!;
          return <Badge tone={roleMeta[role].tone}>{t(roleMeta[role].labelKey)}</Badge>;
        },
      },
      {
        key: 'status',
        header: t('SuperAdminUsersPage.columnStatus'),
        render: (user) => <Badge tone={userStatusMeta[user.status].tone}>{t(userStatusMeta[user.status].labelKey)}</Badge>,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (user) => (
          <span className={styles.actions}>
            <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => handleEdit(user)}>
              {t('SuperAdminUsersPage.edit')}
            </Button>
            {user.status !== 'deactivated' && (
              <Button
                size="sm"
                variant="danger"
                leftIcon={<UserX size={14} />}
                onClick={() => openDeactivate(user)}
              >
                {t('SuperAdminUsersPage.deactivate')}
              </Button>
            )}
          </span>
        ),
      },
    ],
    [handleEdit, openDeactivate, t],
  );

  return (
    <div>
      <PageHeader title={t('SuperAdminUsersPage.title')} description={t('SuperAdminUsersPage.description')} />

      {usersQuery.isError ? (
        <ErrorBanner error={usersQuery.error} onRetry={() => usersQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={usersQuery.data ?? []}
          keyExtractor={getUserId}
          isLoading={usersQuery.isPending}
          emptyTitle={t('SuperAdminUsersPage.emptyTitle')}
        />
      )}

      <EditUserModal user={editing} onClose={handleCloseEdit} />

      <ConfirmDialog
        isOpen={deactivateDialog.isOpen}
        onClose={deactivateDialog.close}
        onConfirm={handleDeactivateConfirm}
        title={t('SuperAdminUsersPage.deactivateDialogTitle')}
        description={
          deactivating
            ? t('SuperAdminUsersPage.deactivateDialogDescription', { name: `${deactivating.firstname} ${deactivating.lastname}` })
            : undefined
        }
        confirmLabel={t('SuperAdminUsersPage.deactivate')}
        tone="danger"
        isLoading={deactivateUser.isPending}
      />
    </div>
  );
}
