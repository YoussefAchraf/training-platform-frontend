import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
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
import { roleMeta } from '@/shared/utils/statusMeta';
import { roleNameOf, type User } from '@/shared/types/domain';
import { useApproveUser, usePendingUsers, useRejectUser } from '@/features/auth/hooks/usePendingUsers';
import styles from './PendingApprovalsPage.module.css';

const getUserId = (user: User) => user.id;

export function PendingApprovalsPage() {
  const { t } = useTranslation('admin');
  const pendingUsersQuery = usePendingUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const toast = useToast();
  const rejectDialog = useDisclosure();
  const [target, setTarget] = useState<User | null>(null);

  const handleApprove = useCallback(
    (user: User) => {
      approveUser.mutate(user.id, {
        onSuccess: () => toast.success(t('PendingApprovalsPage.userApproved', { name: `${user.firstname} ${user.lastname}` })),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      });
    },
    [approveUser, toast, t],
  );

  const openReject = useCallback(
    (user: User) => {
      setTarget(user);
      rejectDialog.open();
    },
    [rejectDialog],
  );

  const handleRejectConfirm = () => {
    if (!target) return;
    rejectUser.mutate(target.id, {
      onSuccess: () => {
        toast.success(t('PendingApprovalsPage.userRejected', { name: `${target.firstname} ${target.lastname}` }));
        rejectDialog.close();
        setTarget(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  const columns = useMemo<TableColumn<User>[]>(
    () => [
      {
        key: 'name',
        header: t('PendingApprovalsPage.columnName'),
        render: (user) => (
          <span>
            {user.firstname} {user.lastname}
          </span>
        ),
      },
      { key: 'email', header: t('PendingApprovalsPage.columnEmail'), render: (user) => user.email },
      {
        key: 'role',
        header: t('PendingApprovalsPage.columnRequestedRole'),
        render: (user) => {
          const role = roleNameOf(user)!;
          return <Badge tone={roleMeta[role].tone}>{t(roleMeta[role].labelKey)}</Badge>;
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (user) => (
          <span className={styles.actions}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<X size={14} />}
              onClick={() => openReject(user)}
              disabled={approveUser.isPending}
            >
              {t('PendingApprovalsPage.reject')}
            </Button>
            <Button
              size="sm"
              leftIcon={<Check size={14} />}
              onClick={() => handleApprove(user)}
              isLoading={approveUser.isPending && approveUser.variables === user.id}
              disabled={approveUser.isPending}
            >
              {t('PendingApprovalsPage.approve')}
            </Button>
          </span>
        ),
      },
    ],
    [approveUser.isPending, approveUser.variables, handleApprove, openReject, t],
  );

  return (
    <div>
      <div id="tour-pending-header">
        <PageHeader title={t('PendingApprovalsPage.title')} description={t('PendingApprovalsPage.description')} />
      </div>

      <div id="tour-pending-table">
        {pendingUsersQuery.isError ? (
          <ErrorBanner error={pendingUsersQuery.error} onRetry={() => pendingUsersQuery.refetch()} />
        ) : (
          <Table
            columns={columns}
            data={pendingUsersQuery.data ?? []}
            keyExtractor={getUserId}
            isLoading={pendingUsersQuery.isPending}
            emptyTitle={t('PendingApprovalsPage.emptyTitle')}
            emptyDescription={t('PendingApprovalsPage.emptyDescription')}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={rejectDialog.isOpen}
        onClose={rejectDialog.close}
        onConfirm={handleRejectConfirm}
        title={t('PendingApprovalsPage.rejectDialogTitle')}
        description={target ? t('PendingApprovalsPage.rejectDialogDescription', { name: `${target.firstname} ${target.lastname}` }) : undefined}
        confirmLabel={t('PendingApprovalsPage.reject')}
        tone="danger"
        isLoading={rejectUser.isPending}
      />
    </div>
  );
}
