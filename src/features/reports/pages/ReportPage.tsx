import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ReportView } from '../components/ReportView';

export function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { canManageCatalog } = useAuth();
  const id = Number(sessionId);

  return (
    <div>
      <PageHeader title={`Session #${id} report`} description="Post-training feedback summary." />
      <Card>
        <ReportView sessionId={id} canGenerate={canManageCatalog} />
      </Card>
    </div>
  );
}
