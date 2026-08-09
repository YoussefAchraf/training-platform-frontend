import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/hooks/useToast';
import type { Instructor } from '@/shared/types/domain';
import { useUpdateInstructor } from '../hooks/useInstructors';
import { InstructorProfileForm } from './InstructorProfileForm';

interface EditInstructorModalProps {
  instructor: Instructor | null;
  onClose: () => void;
}

const FORM_ID = 'edit-instructor-form';

export function EditInstructorModal({ instructor, onClose }: EditInstructorModalProps) {
  const updateInstructor = useUpdateInstructor();
  const toast = useToast();

  if (!instructor) return null;

  return (
    <Modal
      isOpen={Boolean(instructor)}
      onClose={onClose}
      title={`Edit ${instructor.firstname} ${instructor.lastname}`}
      description="Update this instructor's bio and qualified trainings."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateInstructor.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <InstructorProfileForm
        key={instructor.id}
        instructor={instructor}
        formId={FORM_ID}
        hideSubmitButton
        isSubmitting={updateInstructor.isPending}
        submitError={updateInstructor.isError ? updateInstructor.error : undefined}
        onSubmit={(payload) =>
          updateInstructor.mutate(
            { id: instructor.id, payload },
            {
              onSuccess: () => {
                toast.success('Instructor profile updated.');
                onClose();
              },
            },
          )
        }
      />
    </Modal>
  );
}
