import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { FormField } from '@/shared/components/FormField';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useAddAttendee } from '../hooks/useSessions';
import styles from './AddAttendeeForm.module.css';

function buildAttendeeSchema(t: TFunction<'sessions'>) {
  return z.object({
    name: z.string().trim().min(1, t('AddAttendeeForm.errors.nameRequired')).max(150),
    email: z.union([z.email(t('AddAttendeeForm.errors.emailInvalid')), z.literal('')]).optional(),
  });
}

type AttendeeFormValues = z.infer<ReturnType<typeof buildAttendeeSchema>>;

interface AddAttendeeFormProps {
  sessionId: number;
}

export function AddAttendeeForm({ sessionId }: AddAttendeeFormProps) {
  const { t } = useTranslation('sessions');
  const addAttendee = useAddAttendee();
  const attendeeSchema = useMemo(() => buildAttendeeSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendeeFormValues>({ resolver: zodResolver(attendeeSchema) });

  const onSubmit = handleSubmit((values) => {
    addAttendee.mutate(
      { id: sessionId, payload: values },
      { onSuccess: () => reset() },
    );
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {addAttendee.isError && <ErrorBanner error={addAttendee.error} />}

      <div className={styles.fields}>
        <FormField label={t('AddAttendeeForm.nameLabel')} error={errors.name?.message} required>
          {(fieldProps) => <Input placeholder={t('AddAttendeeForm.namePlaceholder')} {...fieldProps} {...register('name')} />}
        </FormField>
        <FormField label={t('AddAttendeeForm.emailLabel')} error={errors.email?.message} hint={t('AddAttendeeForm.emailOptionalHint')}>
          {(fieldProps) => (
            <Input type="email" placeholder={t('AddAttendeeForm.emailPlaceholder')} {...fieldProps} {...register('email')} />
          )}
        </FormField>
      </div>

      <Button type="submit" leftIcon={<UserPlus size={16} />} isLoading={addAttendee.isPending}>
        {t('AddAttendeeForm.addAttendee')}
      </Button>
    </form>
  );
}
