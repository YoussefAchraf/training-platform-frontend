import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ReportView } from '../components/ReportView';

export function ReportPage() {
  const { t } = useTranslation('reports');
  const { sessionId } = useParams<{ sessionId: string }>();
  const { canManageCatalog } = useAuth();
  const id = Number(sessionId);

  return (
    <div>
      <PageHeader title={t('ReportPage.title', { id })} description={t('ReportPage.description')} />
      <Card>
        <ReportView sessionId={id} canGenerate={canManageCatalog} />
      </Card>
    </div>
  );
}
