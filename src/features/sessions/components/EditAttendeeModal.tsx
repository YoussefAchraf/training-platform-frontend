import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import type { SessionAttendee } from '@/shared/types/domain';
import { useUpdateAttendee } from '../hooks/useSessions';
import { buildAttendeeSchema } from './attendeeSchema';
import type { AttendeeFormValues } from './attendeeSchema';

interface EditAttendeeModalProps {
  sessionId: number;
  attendee: SessionAttendee | null;
  onClose: () => void;
}

const FORM_ID = 'edit-attendee-form';

export function EditAttendeeModal({ sessionId, attendee, onClose }: EditAttendeeModalProps) {
  const { t } = useTranslation('sessions');
  const updateAttendee = useUpdateAttendee();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendeeFormValues>({
    resolver: zodResolver(buildAttendeeSchema(t)),
    values: attendee ? { name: attendee.name, email: attendee.email ?? '' } : undefined,
  });

  const handleClose = () => {
    reset();
    updateAttendee.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    if (!attendee) return;
    updateAttendee.mutate(
      { sessionId, attendeeId: attendee.id, payload: values },
      {
        onSuccess: () => {
          toast.success(t('EditAttendeeModal.attendeeUpdated', { name: values.name }));
          handleClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={attendee !== null}
      onClose={handleClose}
      title={t('EditAttendeeModal.title')}
      description={t('EditAttendeeModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('EditAttendeeModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateAttendee.isPending}>
            {t('EditAttendeeModal.saveChanges')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {updateAttendee.isError && <ErrorBanner error={updateAttendee.error} />}

        <FormField label={t('EditAttendeeModal.nameLabel')} error={errors.name?.message} required>
          {(fieldProps) => <Input {...fieldProps} {...register('name')} />}
        </FormField>

        <FormField label={t('EditAttendeeModal.emailLabel')} error={errors.email?.message} hint={t('EditAttendeeModal.emailOptionalHint')}>
          {(fieldProps) => <Input type="email" {...fieldProps} {...register('email')} />}
        </FormField>
      </form>
    </Modal>
  );
}
