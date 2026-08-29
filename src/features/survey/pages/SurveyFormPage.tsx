import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { formatDate } from '@/shared/utils/formatDate';
import { useSubmitSurvey, useSurveyForm } from '../hooks/useSurvey';
import { SurveyForm } from '../components/SurveyForm';
import styles from './SurveyFormPage.module.css';

export function SurveyFormPage() {
  const { t } = useTranslation('survey');
  const { sessionId } = useParams<{ sessionId: string }>();
  const id = Number(sessionId);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formQuery = useSurveyForm(id);
  const submitSurvey = useSubmitSurvey(id);

  if (formQuery.isPending) {
    return (
      <div className={styles.center}>
        <Spinner size={28} />
      </div>
    );
  }

  if (formQuery.isError || !formQuery.data) {
    return <ErrorBanner error={formQuery.error} fallback={t('SurveyFormPage.invalidLink')} />;
  }

  if (isSubmitted) {
    return (
      <Card className={styles.thankYou}>
        <CheckCircle2 size={40} className={styles.thankYouIcon} />
        <h2>{t('SurveyFormPage.thankYouTitle')}</h2>
        <p>{t('SurveyFormPage.thankYouDescription')}</p>
      </Card>
    );
  }

  const info = formQuery.data;

  return (
    <div>
      <Card className={styles.infoCard}>
        <h1 className={styles.title}>{info.trainingName ?? t('SurveyFormPage.unnamedTraining')}</h1>
        <p className={styles.subtitle}>
          {info.instructorName ? t('SurveyFormPage.withInstructor', { name: info.instructorName }) : ''}
          {formatDate(info.startDate)} – {formatDate(info.endDate)}
        </p>
      </Card>

      <Card>
        <SurveyForm
          isSubmitting={submitSurvey.isPending}
          submitError={submitSurvey.isError ? submitSurvey.error : undefined}
          onSubmit={(values) =>
            submitSurvey.mutate(
              { ...values, attendeeId: null },
              { onSuccess: () => setIsSubmitted(true) },
            )
          }
        />
      </Card>
    </div>
  );
}
