import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ban, Pencil, QrCode, UserCog, UserPlus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInstructors, useMyInstructorProfile } from '@/features/instructors/hooks/useInstructors';
import { ReportView } from '@/features/reports/components/ReportView';
import { QRCodeModal } from '@/features/survey/components/QRCodeModal';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta } from '@/shared/utils/statusMeta';
import { useSessionLookups } from '../hooks/useSessionLookups';
import { useCancelSession, useSessions } from '../hooks/useSessions';
import { AssignInstructorModal } from '../components/AssignInstructorModal';
import { EditSessionModal } from '../components/EditSessionModal';
import { RespondActions } from '../components/RespondActions';
import { AddAttendeeForm } from '../components/AddAttendeeForm';
import styles from './SessionDetailPage.module.css';

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const { user, isManager, isInstructor, isSuperAdmin, canManageCatalog } = useAuth();
  const canAssignInstructor = isManager || isSuperAdmin;

  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();
  const instructorsQuery = useInstructors({ enabled: canAssignInstructor });
  
  
  
  
  
  const myProfileQuery = useMyInstructorProfile({ enabled: isInstructor });
  const cancelSession = useCancelSession();
  const toast = useToast();

  const assignModal = useDisclosure();
  const qrModal = useDisclosure();
  const cancelDialog = useDisclosure();
  const [isEditingDates, setIsEditingDates] = useState(false);

  if (sessionsQuery.isPending) {
    return <Spinner />;
  }

  if (sessionsQuery.isError) {
    return <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />;
  }

  const session = sessionsQuery.data?.find((item) => item.id === sessionId);

  if (!session) {
    return (
      <EmptyState
        title="Session not found"
        description="It may have been removed, or you don't have access to it."
      />
    );
  }

  const training = trainingMap.get(session.trainingId);
  const client = clientMap.get(session.clientId);
  const instructor = session.instructorId ? instructorMap.get(session.instructorId) : undefined;
  const isMySession = isInstructor && myProfileQuery.data?.id === session.instructorId;
  const isOwner = session.createdBy === user?.id && canManageCatalog;
  const canEditSession = (isOwner || isSuperAdmin) && session.sessionStatus !== 'cancelled';

  const handleCancelConfirm = () => {
    cancelSession.mutate(session.id, {
      onSuccess: () => {
        toast.success('Session cancelled.');
        cancelDialog.close();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <div>
      <PageHeader
        title={training?.name ?? `Session #${session.id}`}
        description={client ? `Booked for ${client.companyName}` : undefined}
        actions={
          <>
            <Badge
              tone={sessionStatusMeta[session.sessionStatus].tone}
              pulse={sessionStatusMeta[session.sessionStatus].pulse}
            >
              {sessionStatusMeta[session.sessionStatus].label}
            </Badge>
            <Badge
              tone={assignmentStatusMeta[session.assignmentStatus].tone}
              pulse={assignmentStatusMeta[session.assignmentStatus].pulse}
            >
              {assignmentStatusMeta[session.assignmentStatus].label}
            </Badge>
            {canAssignInstructor && (
              <Button variant="outline" size="sm" leftIcon={<UserCog size={15} />} onClick={assignModal.open}>
                {instructor ? 'Reassign' : 'Assign'}
              </Button>
            )}
            {isMySession && (
              <Button variant="outline" size="sm" leftIcon={<QrCode size={15} />} onClick={qrModal.open}>
                Survey QR
              </Button>
            )}
            {canEditSession && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil size={15} />}
                onClick={() => setIsEditingDates(true)}
              >
                Edit dates
              </Button>
            )}
            {canEditSession && (
              <Button variant="danger" size="sm" leftIcon={<Ban size={15} />} onClick={cancelDialog.open}>
                Cancel
              </Button>
            )}
          </>
        }
      />

      {isMySession && session.assignmentStatus === 'pending' && (
        <div className={styles.section}>
          <RespondActions sessionId={session.id} />
        </div>
      )}

      <Card className={styles.section}>
        <h3 className={styles.cardTitle}>Details</h3>
        <dl className={styles.detailList}>
          <div>
            <dt>Provider</dt>
            <dd>{training?.providerName ?? '—'}</dd>
          </div>
          <div>
            <dt>Starts</dt>
            <dd>{formatDateTime(session.startDate)}</dd>
          </div>
          <div>
            <dt>Ends</dt>
            <dd>{formatDateTime(session.endDate)}</dd>
          </div>
          <div>
            <dt>Instructor</dt>
            <dd>{instructor ? `${instructor.firstname} ${instructor.lastname}` : 'Unassigned'}</dd>
          </div>
        </dl>
      </Card>

      <div className={styles.grid}>
        {canManageCatalog && (
          <Card>
            <h3 className={styles.cardTitle}>
              <UserPlus size={16} /> Attendees
            </h3>
            <AddAttendeeForm sessionId={session.id} />
          </Card>
        )}

        <Card>
          <h3 className={styles.cardTitle}>Report</h3>
          <ReportView sessionId={session.id} canGenerate={canManageCatalog} />
        </Card>
      </div>

      {canAssignInstructor && (
        <AssignInstructorModal
          isOpen={assignModal.isOpen}
          onClose={assignModal.close}
          session={session}
          instructors={instructorsQuery.data ?? []}
        />
      )}

      {canEditSession && (
        <EditSessionModal session={isEditingDates ? session : null} onClose={() => setIsEditingDates(false)} />
      )}

      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={cancelDialog.close}
        onConfirm={handleCancelConfirm}
        title="Cancel this session?"
        description="Attendees and the assigned instructor will keep their records, but the session will be marked cancelled."
        confirmLabel="Cancel session"
        tone="danger"
        isLoading={cancelSession.isPending}
      />

      {isMySession && <QRCodeModal isOpen={qrModal.isOpen} onClose={qrModal.close} sessionId={session.id} />}
    </div>
  );
}
