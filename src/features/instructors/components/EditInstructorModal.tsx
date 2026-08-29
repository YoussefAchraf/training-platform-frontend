import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('instructors');
  const updateInstructor = useUpdateInstructor();
  const toast = useToast();

  if (!instructor) return null;

  return (
    <Modal
      isOpen={Boolean(instructor)}
      onClose={onClose}
      title={t('EditInstructorModal.title', { name: `${instructor.firstname} ${instructor.lastname}` })}
      description={t('EditInstructorModal.description')}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('EditInstructorModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateInstructor.isPending}>
            {t('EditInstructorModal.saveChanges')}
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
                toast.success(t('EditInstructorModal.profileUpdated'));
                onClose();
              },
            },
          )
        }
      />
    </Modal>
  );
}
