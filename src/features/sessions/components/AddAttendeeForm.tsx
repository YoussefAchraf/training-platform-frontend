import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { FormField } from '@/shared/components/FormField';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Badge } from '@/shared/components/Badge';
import { Spinner } from '@/shared/components/Spinner';
import { useAddAttendee, useSessionAttendees } from '../hooks/useSessions';
import styles from './AddAttendeeForm.module.css';

const attendeeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  email: z.union([z.email('Enter a valid email address'), z.literal('')]).optional(),
});

type AttendeeFormValues = z.infer<typeof attendeeSchema>;

interface AddAttendeeFormProps {
  sessionId: number;
}

export function AddAttendeeForm({ sessionId }: AddAttendeeFormProps) {
  const addAttendee = useAddAttendee();
  const attendeesQuery = useSessionAttendees(sessionId);

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
    <div>
      <form onSubmit={onSubmit} className={styles.form} noValidate>
        {addAttendee.isError && <ErrorBanner error={addAttendee.error} />}

        <div className={styles.fields}>
          <FormField label="Name" error={errors.name?.message} required>
            {(fieldProps) => <Input placeholder="Attendee name" {...fieldProps} {...register('name')} />}
          </FormField>
          <FormField label="Email" error={errors.email?.message} hint="Optional">
            {(fieldProps) => (
              <Input type="email" placeholder="attendee@company.com" {...fieldProps} {...register('email')} />
            )}
          </FormField>
        </div>

        <Button type="submit" leftIcon={<UserPlus size={16} />} isLoading={addAttendee.isPending}>
          Add attendee
        </Button>
      </form>

      {attendeesQuery.isPending && <Spinner />}

      {attendeesQuery.isError && (
        <ErrorBanner error={attendeesQuery.error} onRetry={() => attendeesQuery.refetch()} />
      )}

      {attendeesQuery.isSuccess && attendeesQuery.data.length === 0 && (
        <p className={styles.note}>No attendees added yet.</p>
      )}

      {attendeesQuery.isSuccess && attendeesQuery.data.length > 0 && (
        <ul className={styles.list}>
          {attendeesQuery.data.map((attendee) => (
            <li key={attendee.id} className={styles.listItem}>
              <span className={styles.listName}>
                <span>{attendee.name}</span>
                {attendee.email && <span className={styles.listEmail}>{attendee.email}</span>}
              </span>
              <Badge tone={attendee.surveySubmitted ? 'success' : 'neutral'}>
                {attendee.surveySubmitted ? 'Submitted' : 'Pending'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
