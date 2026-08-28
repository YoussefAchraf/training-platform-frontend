import { Check, X } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Spinner } from '@/shared/components/Spinner';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { attendanceStatusMeta } from '@/shared/utils/statusMeta';
import { useToast } from '@/shared/hooks/useToast';
import { useMarkAttendance, useSessionAttendees } from '../hooks/useSessions';
import styles from './AttendeeList.module.css';

interface AttendeeListProps {
  sessionId: number;
  canMarkAttendance: boolean;
}

export function AttendeeList({ sessionId, canMarkAttendance }: AttendeeListProps) {
  const attendeesQuery = useSessionAttendees(sessionId);
  const markAttendance = useMarkAttendance();
  const toast = useToast();

  const handleMark = (attendeeId: number, status: 'present' | 'absent') => {
    markAttendance.mutate(
      { sessionId, attendeeId, status },
      {
        onSuccess: () => toast.success(status === 'present' ? 'Marked present.' : 'Marked absent.'),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  if (attendeesQuery.isPending) return <Spinner />;

  if (attendeesQuery.isError) {
    return <ErrorBanner error={attendeesQuery.error} onRetry={() => attendeesQuery.refetch()} />;
  }

  if (attendeesQuery.data.length === 0) {
    return <p className={styles.note}>No attendees added yet.</p>;
  }

  return (
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
              <Badge tone={attendee.surveySubmitted ? 'success' : 'neutral'}>
                {attendee.surveySubmitted ? 'Submitted' : 'Survey pending'}
              </Badge>

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
                    Absent
                  </Button>
                  <Button
                    size="sm"
                    variant={attendee.attendanceStatus === 'present' ? 'primary' : 'outline'}
                    leftIcon={<Check size={14} />}
                    onClick={() => handleMark(attendee.id, 'present')}
                    isLoading={isMarking && markAttendance.variables?.status === 'present'}
                    disabled={markAttendance.isPending}
                  >
                    Present
                  </Button>
                </span>
              ) : (
                <Badge tone={attendanceStatusMeta[attendee.attendanceStatus].tone}>
                  {attendanceStatusMeta[attendee.attendanceStatus].label}
                </Badge>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
