import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Spinner } from '@/shared/components/Spinner';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { attendanceStatusMeta } from '@/shared/utils/statusMeta';
import { useToast } from '@/shared/hooks/useToast';
import type { SessionAttendee } from '@/shared/types/domain';
import { useDeleteAttendee, useMarkAttendance, useSessionAttendees } from '../hooks/useSessions';
import { EditAttendeeModal } from './EditAttendeeModal';
import styles from './AttendeeList.module.css';

interface AttendeeListProps {
  sessionId: number;
  canMarkAttendance: boolean;
  canEdit?: boolean;
}

export function AttendeeList({ sessionId, canMarkAttendance, canEdit = false }: AttendeeListProps) {
  const { t } = useTranslation('sessions');
  const attendeesQuery = useSessionAttendees(sessionId);
  const markAttendance = useMarkAttendance();
  const deleteAttendee = useDeleteAttendee();
  const toast = useToast();
  const [editingAttendee, setEditingAttendee] = useState<SessionAttendee | null>(null);
  const [deletingAttendee, setDeletingAttendee] = useState<SessionAttendee | null>(null);

  const handleMark = (attendeeId: number, status: 'present' | 'absent') => {
    markAttendance.mutate(
      { sessionId, attendeeId, status },
      {
        onSuccess: () => toast.success(status === 'present' ? t('AttendeeList.markedPresent') : t('AttendeeList.markedAbsent')),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingAttendee) return;
    deleteAttendee.mutate(
      { sessionId, attendeeId: deletingAttendee.id },
      {
        onSuccess: () => {
          toast.success(t('AttendeeList.attendeeRemoved', { name: deletingAttendee.name }));
          setDeletingAttendee(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  if (attendeesQuery.isPending) return <Spinner />;

  if (attendeesQuery.isError) {
    return <ErrorBanner error={attendeesQuery.error} onRetry={() => attendeesQuery.refetch()} />;
  }

  if (attendeesQuery.data.length === 0) {
    return <p className={styles.note}>{t('AttendeeList.noAttendees')}</p>;
  }

  return (
    <>
      <ul className={styles.list}>
        {attendeesQuery.data.map((attendee) => {
          const isMarking =
            markAttendance.isPending && markAttendance.variables?.attendeeId === attendee.id;

          return (
            <li key={attendee.id} className={styles.listItem}>
              <span className={styles.listName}>
                <span>{attendee.name}</span>
                {attendee.email && <span className={styles.listEmail}>{attendee.email}</span>}
              </span>

              <span className={styles.statusGroup}>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('AttendeeList.editAttendee', { name: attendee.name })}
                    onClick={() => setEditingAttendee(attendee)}
                  >
                    <Pencil size={14} />
                  </Button>
                )}

                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('AttendeeList.removeAttendee', { name: attendee.name })}
                    onClick={() => setDeletingAttendee(attendee)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}

                {attendee.surveySubmitted && <Badge tone="success">{t('AttendeeList.surveySubmitted')}</Badge>}

                {canMarkAttendance ? (
                  <span className={styles.attendanceActions}>
                    <Button
                      size="sm"
                      variant={attendee.attendanceStatus === 'absent' ? 'danger' : 'outline'}
                      leftIcon={<X size={14} />}
                      onClick={() => handleMark(attendee.id, 'absent')}
                      isLoading={isMarking && markAttendance.variables?.status === 'absent'}
                      disabled={markAttendance.isPending}
                    >
                      {t('AttendeeList.markAbsent')}
                    </Button>
                    <Button
                      size="sm"
                      variant={attendee.attendanceStatus === 'present' ? 'primary' : 'outline'}
                      leftIcon={<Check size={14} />}
                      onClick={() => handleMark(attendee.id, 'present')}
                      isLoading={isMarking && markAttendance.variables?.status === 'present'}
                      disabled={markAttendance.isPending}
                    >
                      {t('AttendeeList.markPresent')}
                    </Button>
                  </span>
                ) : (
                  <Badge tone={attendanceStatusMeta[attendee.attendanceStatus].tone}>
                    {t(attendanceStatusMeta[attendee.attendanceStatus].labelKey)}
                  </Badge>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <EditAttendeeModal sessionId={sessionId} attendee={editingAttendee} onClose={() => setEditingAttendee(null)} />

      <ConfirmDialog
        isOpen={deletingAttendee !== null}
        onClose={() => setDeletingAttendee(null)}
        onConfirm={handleDeleteConfirm}
        title={t('AttendeeList.deleteDialogTitle')}
        description={deletingAttendee ? t('AttendeeList.deleteDialogDescription', { name: deletingAttendee.name }) : undefined}
        confirmLabel={t('AttendeeList.remove')}
        tone="danger"
        isLoading={deleteAttendee.isPending}
      />
    </>
  );
}
