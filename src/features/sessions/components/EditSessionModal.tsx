import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { toDatetimeLocalValue } from '@/shared/utils/formatDate';
import type { TrainingSession } from '@/shared/types/domain';
import { useUpdateSession } from '../hooks/useSessions';

const editSessionSchema = z
  .object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after the start date',
    path: ['endDate'],
  });

type EditSessionFormValues = z.infer<typeof editSessionSchema>;

interface EditSessionModalProps {
  session: TrainingSession | null;
  onClose: () => void;
}

const FORM_ID = 'edit-session-form';

export function EditSessionModal({ session, onClose }: EditSessionModalProps) {
  const updateSession = useUpdateSession();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditSessionFormValues>({
    resolver: zodResolver(editSessionSchema),
    values: session
      ? { startDate: toDatetimeLocalValue(session.startDate), endDate: toDatetimeLocalValue(session.endDate) }
      : undefined,
  });

  if (!session) return null;

  const onSubmit = handleSubmit((values) => {
    updateSession.mutate(
      {
        id: session.id,
        payload: {
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Session dates updated.');
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(session)}
      onClose={onClose}
      title="Edit session dates"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateSession.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {updateSession.isError && <ErrorBanner error={updateSession.error} />}

        <FormField label="Start date & time" error={errors.startDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('startDate')} />}
        </FormField>

        <FormField label="End date & time" error={errors.endDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('endDate')} />}
        </FormField>
      </form>
    </Modal>
  );
}
