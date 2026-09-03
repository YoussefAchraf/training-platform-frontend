import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { EmptyState } from '@/shared/components/EmptyState';
import { Skeleton } from '@/shared/components/Skeleton';
import { useFeedbackReports } from '@/features/feedback/hooks/useFeedback';
import { formatDateTime } from '@/shared/utils/formatDate';
import { feedbackCategoryMeta, roleMeta } from '@/shared/utils/statusMeta';
import { staggerContainer, listItem } from '@/shared/motion/variants';
import styles from './DeveloperFeedbackPage.module.css';

export function DeveloperFeedbackPage() {
  const { t } = useTranslation('developer');
  const reportsQuery = useFeedbackReports();
  const reports = reportsQuery.data ?? [];

  return (
    <div>
      <PageHeader title={t('DeveloperFeedbackPage.title')} description={t('DeveloperFeedbackPage.description')} />

      {reportsQuery.isError ? (
        <ErrorBanner error={reportsQuery.error} onRetry={() => reportsQuery.refetch()} />
      ) : reportsQuery.isPending ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={92} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t('DeveloperFeedbackPage.emptyTitle')}
          description={t('DeveloperFeedbackPage.emptyDescription')}
        />
      ) : (
        <motion.ul className={styles.list} variants={staggerContainer(0.03)} initial="hidden" animate="show">
          {reports.map((report) => (
            <motion.li key={report.id} variants={listItem}>
              <Card className={styles.row} padded>
                <div className={styles.rowHeader}>
                  <div className={styles.submitter}>
                    <span className={styles.submitterName}>{report.submitterName}</span>
                    <span className={styles.submitterEmail}>{report.submitterEmail}</span>
                  </div>
                  <div className={styles.badges}>
                    <Badge tone={roleMeta[report.submitterRole]?.tone ?? 'neutral'}>
                      {t(roleMeta[report.submitterRole]?.labelKey ?? report.submitterRole)}
                    </Badge>
                    <Badge tone={feedbackCategoryMeta[report.category].tone}>
                      {t(feedbackCategoryMeta[report.category].labelKey)}
                    </Badge>
                  </div>
                </div>
                <p className={styles.message}>{report.message}</p>
                <p className={styles.timestamp}>{formatDateTime(report.createdAt)}</p>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
