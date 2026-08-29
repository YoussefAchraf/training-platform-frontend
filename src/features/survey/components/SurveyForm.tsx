import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Textarea } from '@/shared/components/Textarea';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ScoreScale } from './ScoreScale';
import styles from './SurveyForm.module.css';

function buildSurveyFormSchema(t: TFunction<'survey'>) {
  return z.object({
    instructorScore: z.number({ error: t('SurveyForm.errors.instructorScoreRequired') }).min(0).max(5),
    npsScore: z.number({ error: t('SurveyForm.errors.npsScoreRequired') }).min(0).max(10),
    comments: z.string().trim().max(2000).optional(),
  });
}

export type SurveyFormValues = z.infer<ReturnType<typeof buildSurveyFormSchema>>;

interface SurveyFormProps {
  onSubmit: (values: SurveyFormValues) => void;
  isSubmitting: boolean;
  submitError?: unknown;
}

export function SurveyForm({ onSubmit, isSubmitting, submitError }: SurveyFormProps) {
  const { t } = useTranslation('survey');
  const surveyFormSchema = useMemo(() => buildSurveyFormSchema(t), [t]);
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
        <p className={styles.question}>{t('SurveyForm.instructorQuestion')}</p>
        <Controller
          control={control}
          name="instructorScore"
          render={({ field }) => (
            <ScoreScale max={5} value={field.value} onChange={field.onChange} minLabel={t('SurveyForm.instructorMin')} maxLabel={t('SurveyForm.instructorMax')} />
          )}
        />
        {errors.instructorScore && <p className={styles.error}>{errors.instructorScore.message}</p>}
      </div>

      <div>
        <p className={styles.question}>{t('SurveyForm.npsQuestion')}</p>
        <Controller
          control={control}
          name="npsScore"
          render={({ field }) => (
            <ScoreScale
              max={10}
              value={field.value}
              onChange={field.onChange}
              minLabel={t('SurveyForm.npsMin')}
              maxLabel={t('SurveyForm.npsMax')}
            />
          )}
        />
        {errors.npsScore && <p className={styles.error}>{errors.npsScore.message}</p>}
      </div>

      <FormField label={t('SurveyForm.commentsLabel')} error={errors.comments?.message} hint={t('SurveyForm.commentsOptionalHint')}>
        {(fieldProps) => (
          <Textarea placeholder={t('SurveyForm.commentsPlaceholder')} {...fieldProps} {...register('comments')} />
        )}
      </FormField>

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        {t('SurveyForm.submit')}
      </Button>
    </form>
  );
}
