import { useState } from 'react';
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
          toast.success('Instructor assigned. Awaiting their response.');
          handleClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign instructor"
      description="The instructor will be notified and can accept or refuse this session."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={assignInstructor.isPending} disabled={!instructorId}>
            Assign
          </Button>
        </>
      }
    >
      <div className="stack">
        {assignInstructor.isError && <ErrorBanner error={assignInstructor.error} />}

        <FormField
          label="Instructor"
          required
          hint={
            qualified.length === 0
              ? "No instructors are currently marked as qualified for this training. An instructor can add it under their own profile, or a Manager can add it via Instructors > Edit."
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
                {qualified.length > 0 ? 'Select an instructor' : 'No qualified instructors available'}
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
