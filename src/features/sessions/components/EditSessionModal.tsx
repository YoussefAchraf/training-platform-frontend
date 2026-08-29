import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { toDatetimeLocalValue } from '@/shared/utils/formatDate';
import type { TrainingSession } from '@/shared/types/domain';
import { useUpdateSession } from '../hooks/useSessions';

function buildEditSessionSchema(t: TFunction<'sessions'>) {
  return z
    .object({
      startDate: z.string().min(1, t('EditSessionModal.errors.startDateRequired')),
      endDate: z.string().min(1, t('EditSessionModal.errors.endDateRequired')),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: t('EditSessionModal.errors.endAfterStart'),
      path: ['endDate'],
    });
}

type EditSessionFormValues = z.infer<ReturnType<typeof buildEditSessionSchema>>;

interface EditSessionModalProps {
  session: TrainingSession | null;
  onClose: () => void;
}

const FORM_ID = 'edit-session-form';

export function EditSessionModal({ session, onClose }: EditSessionModalProps) {
  const { t } = useTranslation('sessions');
  const updateSession = useUpdateSession();
  const toast = useToast();
  const editSessionSchema = useMemo(() => buildEditSessionSchema(t), [t]);

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
          toast.success(t('EditSessionModal.datesUpdated'));
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(session)}
      onClose={onClose}
      title={t('EditSessionModal.title')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('EditSessionModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateSession.isPending}>
            {t('EditSessionModal.saveChanges')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {updateSession.isError && <ErrorBanner error={updateSession.error} />}

        <FormField label={t('EditSessionModal.startDateTimeLabel')} error={errors.startDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('startDate')} />}
        </FormField>

        <FormField label={t('EditSessionModal.endDateTimeLabel')} error={errors.endDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('endDate')} />}
        </FormField>
      </form>
    </Modal>
  );
}
