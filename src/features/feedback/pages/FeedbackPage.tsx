import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { MessageSquareHeart } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useSubmitFeedback } from '../hooks/useFeedback';
import styles from './FeedbackPage.module.css';

function buildFeedbackSchema(t: TFunction<'feedback'>) {
  return z.object({
    category: z.enum(['bug', 'enhancement', 'other'], { error: t('FeedbackPage.errors.categoryRequired') }),
    message: z.string().trim().min(1, t('FeedbackPage.errors.messageRequired')).max(4000),
  });
}

type FeedbackFormValues = z.infer<ReturnType<typeof buildFeedbackSchema>>;

export function FeedbackPage() {
  const { t } = useTranslation('feedback');
  const submitFeedback = useSubmitFeedback();
  const toast = useToast();
  const feedbackSchema = useMemo(() => buildFeedbackSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({ resolver: zodResolver(feedbackSchema) });

  const onSubmit = handleSubmit((values) => {
    submitFeedback.mutate(values, {
      onSuccess: () => {
        toast.success(t('FeedbackPage.successTitle'));
        reset({ category: undefined, message: '' });
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t('FeedbackPage.genericError'))),
    });
  });

  return (
    <div>
      <div id="tour-feedback-header">
        <PageHeader title={t('FeedbackPage.title')} description={t('FeedbackPage.description')} />
      </div>

      <Card className={styles.card} id="tour-feedback-form">
        <div className={styles.icon}>
          <MessageSquareHeart size={22} />
        </div>

        <form onSubmit={onSubmit} className="stack" noValidate>
          {submitFeedback.isError && <ErrorBanner error={submitFeedback.error} />}

          <FormField label={t('FeedbackPage.categoryLabel')} error={errors.category?.message} required>
            {(fieldProps) => (
              <Select {...fieldProps} {...register('category')} defaultValue="">
                <option value="" disabled>
                  {t('FeedbackPage.selectCategory')}
                </option>
                <option value="bug">{t('FeedbackCategories.bug')}</option>
                <option value="enhancement">{t('FeedbackCategories.enhancement')}</option>
                <option value="other">{t('FeedbackCategories.other')}</option>
              </Select>
            )}
          </FormField>

          <FormField label={t('FeedbackPage.messageLabel')} error={errors.message?.message} required>
            {(fieldProps) => (
              <Textarea rows={6} placeholder={t('FeedbackPage.messagePlaceholder')} {...fieldProps} {...register('message')} />
            )}
          </FormField>

          <Button type="submit" isLoading={submitFeedback.isPending}>
            {t('FeedbackPage.submit')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
