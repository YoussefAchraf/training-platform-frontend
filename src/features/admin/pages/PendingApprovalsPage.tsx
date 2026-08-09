import { useCallback, useMemo, useState } from 'react';
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
  const pendingUsersQuery = usePendingUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const toast = useToast();
  const rejectDialog = useDisclosure();
  const [target, setTarget] = useState<User | null>(null);

  const handleApprove = useCallback(
    (user: User) => {
      approveUser.mutate(user.id, {
        onSuccess: () => toast.success(`${user.firstname} ${user.lastname} was approved.`),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      });
    },
    [approveUser, toast],
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
        toast.success(`${target.firstname} ${target.lastname} was rejected.`);
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
        header: 'Requested role',
        render: (user) => {
          const role = roleNameOf(user)!;
          return <Badge tone={roleMeta[role].tone}>{roleMeta[role].label}</Badge>;
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
              Reject
            </Button>
            <Button
              size="sm"
              leftIcon={<Check size={14} />}
              onClick={() => handleApprove(user)}
              isLoading={approveUser.isPending && approveUser.variables === user.id}
              disabled={approveUser.isPending}
            >
              Approve
            </Button>
          </span>
        ),
      },
    ],
    [approveUser.isPending, approveUser.variables, handleApprove, openReject],
  );

  return (
    <div>
      <PageHeader title="Pending approvals" description="New accounts waiting for review before they can sign in." />

      {pendingUsersQuery.isError ? (
        <ErrorBanner error={pendingUsersQuery.error} onRetry={() => pendingUsersQuery.refetch()} />
      ) : (
        <Table
          columns={columns}
          data={pendingUsersQuery.data ?? []}
          keyExtractor={getUserId}
          isLoading={pendingUsersQuery.isPending}
          emptyTitle="No pending accounts"
          emptyDescription="New signups will show up here for review."
        />
      )}

      <ConfirmDialog
        isOpen={rejectDialog.isOpen}
        onClose={rejectDialog.close}
        onConfirm={handleRejectConfirm}
        title="Reject this account?"
        description={target ? `${target.firstname} ${target.lastname} won't be able to sign in.` : undefined}
        confirmLabel="Reject"
        tone="danger"
        isLoading={rejectUser.isPending}
      />
    </div>
  );
}
