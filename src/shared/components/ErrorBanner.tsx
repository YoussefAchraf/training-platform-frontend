import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { Button } from './Button';
import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  error: unknown;
  onRetry?: () => void;
  fallback?: string;
}

export function ErrorBanner({ error, onRetry, fallback }: ErrorBannerProps) {
  const { t } = useTranslation('common');
  return (
    <div className={styles.banner} role="alert">
      <AlertTriangle size={18} className={styles.icon} />
      <p className={styles.message}>{getApiErrorMessage(error, fallback ?? t('ErrorBanner.fallback'))}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />}>
          {t('ErrorBanner.retry')}
        </Button>
      )}
    </div>
  );
}
