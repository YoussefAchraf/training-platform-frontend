import { useTranslation } from 'react-i18next';
import { Download, FileBarChart } from 'lucide-react';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/Button';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { formatDateTime } from '@/shared/utils/formatDate';
import { useDownloadReportPdf, useGenerateReport, useReport } from '../hooks/useReport';
import styles from './ReportView.module.css';

interface ReportViewProps {
  sessionId: number;
  canGenerate: boolean;
}

export function ReportView({ sessionId, canGenerate }: ReportViewProps) {
  const { t } = useTranslation('reports');
  const reportQuery = useReport(sessionId);
  const generateReport = useGenerateReport();
  const downloadPdf = useDownloadReportPdf();
  const toast = useToast();

  const handleDownload = () => {
    downloadPdf.mutate(sessionId, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${sessionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t('ReportView.downloadFailed'))),
    });
  };

  if (reportQuery.isPending) {
    return <Spinner />;
  }

  if (reportQuery.isError) {
    return <ErrorBanner error={reportQuery.error} onRetry={() => reportQuery.refetch()} />;
  }

  if (!reportQuery.data) {
    return (
      <EmptyState
        icon={FileBarChart}
        title={t('ReportView.notGeneratedTitle')}
        description={t('ReportView.notGeneratedDescription')}
        action={
          canGenerate && (
            <Button
              isLoading={generateReport.isPending}
              onClick={() =>
                generateReport.mutate(sessionId, {
                  onSuccess: () => toast.success(t('ReportView.reportGenerated')),
                  onError: (error) => toast.error(getApiErrorMessage(error)),
                })
              }
            >
              {t('ReportView.generateNow')}
            </Button>
          )
        }
      />
    );
  }

  const report = reportQuery.data;

  return (
    <div>
      <div className={styles.grid}>
        <div className={styles.tile}>
          <p className={styles.tileLabel}>{t('ReportView.averageInstructorScore')}</p>
          <p className={styles.tileValue}>
            {report.averageScore}
            <span className={styles.tileMax}>/ 5</span>
          </p>
        </div>
        <div className={styles.tile}>
          <p className={styles.tileLabel}>{t('ReportView.npsAverage')}</p>
          <p className={styles.tileValue}>
            {report.npsAverage}
            <span className={styles.tileMax}>%</span>
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.generatedAt}>{t('ReportView.generatedAt', { date: formatDateTime(report.generatedAt) })}</p>
        <Button variant="outline" size="sm" leftIcon={<Download size={14} />} isLoading={downloadPdf.isPending} onClick={handleDownload}>
          {t('ReportView.downloadPdf')}
        </Button>
      </div>
    </div>
  );
}
