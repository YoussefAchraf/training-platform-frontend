import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useCancelSession, useSessionAttendees, useSessions } from '../hooks/useSessions';
import { AssignInstructorModal } from '../components/AssignInstructorModal';
import { EditSessionModal } from '../components/EditSessionModal';
import { AddAttendeeForm } from '../components/AddAttendeeForm';
import { AttendeeImportForm } from '../components/AttendeeImportForm';
import { AttendeeList } from '../components/AttendeeList';
import styles from './SessionDetailPage.module.css';

export function SessionDetailPage() {
  const { t } = useTranslation('sessions');
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const { user, isManager, isInstructor, isSuperAdmin, canManageCatalog } = useAuth();
  const canAssignInstructor = isManager || isSuperAdmin;

  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();
  const instructorsQuery = useInstructors({ enabled: canAssignInstructor });
  
  
  
  
  const attendeesQuery = useSessionAttendees(sessionId, { enabled: canAssignInstructor });
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
        title={t('SessionDetailPage.notFoundTitle')}
        description={t('SessionDetailPage.notFoundDescription')}
      />
    );
  }

  const training = trainingMap.get(session.trainingId);
  const client = clientMap.get(session.clientId);
  const instructor = session.instructorId ? instructorMap.get(session.instructorId) : undefined;
  const hasAttendees = (attendeesQuery.data?.length ?? 0) > 0;
  const isMySession = isInstructor && myProfileQuery.data?.id === session.instructorId;
  const isOwner = session.createdBy === user?.id && canManageCatalog;
  const canEditSession = (isOwner || isSuperAdmin) && session.sessionStatus !== 'cancelled';

  const handleCancelConfirm = () => {
    cancelSession.mutate(session.id, {
      onSuccess: () => {
        toast.success(t('SessionDetailPage.sessionCancelled'));
        cancelDialog.close();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <div>
      <div id="tour-session-header">
        <PageHeader
          title={training?.name ?? t('SessionDetailPage.unnamedSession', { id: session.id })}
          description={client ? t('SessionDetailPage.bookedFor', { client: client.companyName }) : undefined}
          actions={
            <>
              <Badge
                tone={sessionStatusMeta[session.sessionStatus].tone}
                pulse={sessionStatusMeta[session.sessionStatus].pulse}
              >
                {t(sessionStatusMeta[session.sessionStatus].labelKey)}
              </Badge>
              <Badge
                tone={assignmentStatusMeta[session.assignmentStatus].tone}
                pulse={assignmentStatusMeta[session.assignmentStatus].pulse}
              >
                {t(assignmentStatusMeta[session.assignmentStatus].labelKey)}
              </Badge>
              {canAssignInstructor && (
                <Button
                  id="tour-session-assign"
                  variant="outline"
                  size="sm"
                  leftIcon={<UserCog size={15} />}
                  onClick={assignModal.open}
                  disabled={!hasAttendees}
                  title={hasAttendees ? undefined : t('SessionDetailPage.assignDisabledHint')}
                >
                  {instructor ? t('SessionDetailPage.reassign') : t('SessionDetailPage.assign')}
                </Button>
              )}
              {isMySession && (
                <Button id="tour-session-qr" variant="outline" size="sm" leftIcon={<QrCode size={15} />} onClick={qrModal.open}>
                  {t('SessionDetailPage.surveyQr')}
                </Button>
              )}
              {canEditSession && (
                <Button
                  id="tour-session-edit"
                  variant="outline"
                  size="sm"
                  leftIcon={<Pencil size={15} />}
                  onClick={() => setIsEditingDates(true)}
                >
                  {t('SessionDetailPage.editDates')}
                </Button>
              )}
              {canEditSession && (
                <Button id="tour-session-cancel" variant="danger" size="sm" leftIcon={<Ban size={15} />} onClick={cancelDialog.open}>
                  {t('SessionDetailPage.cancel')}
                </Button>
              )}
            </>
          }
        />
      </div>

      <Card id="tour-session-details" className={styles.section}>
        <h3 className={styles.cardTitle}>{t('SessionDetailPage.detailsCardTitle')}</h3>
        <dl className={styles.detailList}>
          <div>
            <dt>{t('SessionDetailPage.provider')}</dt>
            <dd>{training?.providerName ?? '—'}</dd>
          </div>
          <div>
            <dt>{t('SessionDetailPage.starts')}</dt>
            <dd>{formatDateTime(session.startDate)}</dd>
          </div>
          <div>
            <dt>{t('SessionDetailPage.ends')}</dt>
            <dd>{formatDateTime(session.endDate)}</dd>
          </div>
          <div>
            <dt>{t('SessionDetailPage.instructor')}</dt>
            <dd>{instructor ? `${instructor.firstname} ${instructor.lastname}` : t('SessionDetailPage.unassigned')}</dd>
          </div>
        </dl>
      </Card>

      <div className={styles.grid}>
        {(canManageCatalog || isSuperAdmin || isMySession) && (
          <Card id="tour-session-attendees">
            <h3 className={styles.cardTitle}>
              <UserPlus size={16} /> {t('SessionDetailPage.attendeesCardTitle')}
            </h3>
            <div className="stack">
              {canManageCatalog && (
                <>
                  <AddAttendeeForm sessionId={session.id} />
                  <AttendeeImportForm sessionId={session.id} />
                </>
              )}
              <AttendeeList sessionId={session.id} canMarkAttendance={isMySession} />
            </div>
          </Card>
        )}

        <Card id="tour-session-report">
          <h3 className={styles.cardTitle}>{t('SessionDetailPage.reportCardTitle')}</h3>
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
        title={t('SessionDetailPage.cancelDialogTitle')}
        description={t('SessionDetailPage.cancelDialogDescription')}
        confirmLabel={t('SessionDetailPage.cancelSession')}
        tone="danger"
        isLoading={cancelSession.isPending}
      />

      {isMySession && <QRCodeModal isOpen={qrModal.isOpen} onClose={qrModal.close} sessionId={session.id} />}
    </div>
  );
}
