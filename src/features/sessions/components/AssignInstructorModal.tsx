import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Select } from '@/shared/components/Select';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import type { Instructor, TrainingSession } from '@/shared/types/domain';
import { useAssignInstructor } from '../hooks/useSessions';

interface AssignInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession;
  instructors: Instructor[];
}

export function AssignInstructorModal({ isOpen, onClose, session, instructors }: AssignInstructorModalProps) {
  const { t } = useTranslation('sessions');
  const [instructorId, setInstructorId] = useState('');
  const assignInstructor = useAssignInstructor();
  const toast = useToast();

  
  
  
  
  const qualified = instructors.filter((instructor) =>
    instructor.skills.some((skill) => skill.trainingId === session.trainingId),
  );

  const handleClose = () => {
    setInstructorId('');
    assignInstructor.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!instructorId) return;
    assignInstructor.mutate(
      { id: session.id, instructorId: Number(instructorId) },
      {
        onSuccess: () => {
          toast.success(t('AssignInstructorModal.instructorAssigned'));
          handleClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('AssignInstructorModal.title')}
      description={t('AssignInstructorModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('AssignInstructorModal.cancel')}
          </Button>
          <Button onClick={handleSubmit} isLoading={assignInstructor.isPending} disabled={!instructorId}>
            {t('AssignInstructorModal.assign')}
          </Button>
        </>
      }
    >
      <div className="stack">
        {assignInstructor.isError && <ErrorBanner error={assignInstructor.error} />}

        <FormField
          label={t('AssignInstructorModal.instructorLabel')}
          required
          hint={
            qualified.length === 0
              ? t('AssignInstructorModal.noQualifiedHint')
              : undefined
          }
        >
          {(fieldProps) => (
            <Select
              {...fieldProps}
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
              disabled={qualified.length === 0}
            >
              <option value="" disabled>
                {qualified.length > 0 ? t('AssignInstructorModal.selectInstructor') : t('AssignInstructorModal.noQualifiedAvailable')}
              </option>
              {qualified.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.firstname} {instructor.lastname}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
    </Modal>
  );
}
