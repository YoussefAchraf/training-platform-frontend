import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Textarea } from '@/shared/components/Textarea';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ScoreScale } from './ScoreScale';
import styles from './SurveyForm.module.css';

const surveyFormSchema = z.object({
  instructorScore: z.number({ error: 'Rate the instructor' }).min(0).max(5),
  npsScore: z.number({ error: 'Rate the training' }).min(0).max(10),
  comments: z.string().trim().max(2000).optional(),
});

export type SurveyFormValues = z.infer<typeof surveyFormSchema>;

interface SurveyFormProps {
  onSubmit: (values: SurveyFormValues) => void;
  isSubmitting: boolean;
  submitError?: unknown;
}

export function SurveyForm({ onSubmit, isSubmitting, submitError }: SurveyFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormValues>({ resolver: zodResolver(surveyFormSchema) });

  const submit = handleSubmit(onSubmit);

  return (
    <form onSubmit={submit} className="stack" noValidate>
      {Boolean(submitError) && <ErrorBanner error={submitError} />}

      <div>
        <p className={styles.question}>How would you rate the instructor?</p>
        <Controller
          control={control}
          name="instructorScore"
          render={({ field }) => (
            <ScoreScale max={5} value={field.value} onChange={field.onChange} minLabel="Poor" maxLabel="Excellent" />
          )}
        />
        {errors.instructorScore && <p className={styles.error}>{errors.instructorScore.message}</p>}
      </div>

      <div>
        <p className={styles.question}>How likely are you to recommend this training?</p>
        <Controller
          control={control}
          name="npsScore"
          render={({ field }) => (
            <ScoreScale
              max={10}
              value={field.value}
              onChange={field.onChange}
              minLabel="Not likely"
              maxLabel="Very likely"
            />
          )}
        />
        {errors.npsScore && <p className={styles.error}>{errors.npsScore.message}</p>}
      </div>

      <FormField label="Comments" error={errors.comments?.message} hint="Optional">
        {(fieldProps) => (
          <Textarea placeholder="Anything you'd like to share…" {...fieldProps} {...register('comments')} />
        )}
      </FormField>

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Submit feedback
      </Button>
    </form>
  );
}
