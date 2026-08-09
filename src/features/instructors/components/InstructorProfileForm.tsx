import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Textarea } from '@/shared/components/Textarea';
import { Checkbox } from '@/shared/components/Checkbox';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Spinner } from '@/shared/components/Spinner';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import type { Instructor } from '@/shared/types/domain';
import styles from './InstructorProfileForm.module.css';

const profileSchema = z.object({
  bio: z.string().trim().max(2000).optional(),
  trainingIds: z.array(z.coerce.number()).optional(),
});

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormOutput = z.output<typeof profileSchema>;

interface InstructorProfileFormProps {
  instructor: Instructor;
  onSubmit: (payload: { bio?: string; trainingIds?: number[] }) => void;
  isSubmitting: boolean;
  submitError?: unknown;
  formId?: string;
  submitLabel?: string;
  hideSubmitButton?: boolean;
}

export function InstructorProfileForm({
  instructor,
  onSubmit,
  isSubmitting,
  submitError,
  formId = 'instructor-profile-form',
  submitLabel = 'Save changes',
  hideSubmitButton = false,
}: InstructorProfileFormProps) {
  const trainingsQuery = useTrainings();

  const { register, handleSubmit } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: instructor.bio ?? '',
      trainingIds: instructor.skills.map((skill) => String(skill.trainingId)),
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({ bio: values.bio, trainingIds: values.trainingIds ?? [] });
  });

  return (
    <form onSubmit={submit} id={formId} className="stack" noValidate>
      {Boolean(submitError) && <ErrorBanner error={submitError} />}

      <FormField label="Bio" hint="Shown to Managers when assigning sessions">
        {(fieldProps) => (
          <Textarea placeholder="Tell us about your teaching experience…" {...fieldProps} {...register('bio')} />
        )}
      </FormField>

      <div>
        <p className={styles.skillsLabel}>Trainings I can deliver</p>
        {trainingsQuery.isPending ? (
          <Spinner size={20} />
        ) : trainingsQuery.data && trainingsQuery.data.length > 0 ? (
          <div className={styles.skillsGrid}>
            {trainingsQuery.data.map((training) => (
              <Checkbox
                key={training.id}
                value={training.id}
                label={training.name}
                {...register('trainingIds')}
              />
            ))}
          </div>
        ) : (
          <p className={styles.skillsEmpty}>No trainings exist yet - a Manager needs to add some first.</p>
        )}
      </div>

      {!hideSubmitButton && (
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      )}
    </form>
  );
}
