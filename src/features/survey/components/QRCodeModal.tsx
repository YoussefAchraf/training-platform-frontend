import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Button } from '@/shared/components/Button';
import { useSurveyQrCode } from '../hooks/useSurvey';
import styles from './QRCodeModal.module.css';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
}

export function QRCodeModal({ isOpen, onClose, sessionId }: QRCodeModalProps) {
  const { t } = useTranslation('survey');
  const [copied, setCopied] = useState(false);
  const qrQuery = useSurveyQrCode(sessionId, { enabled: isOpen });

  const handleCopy = async () => {
    if (!qrQuery.data) return;
    await navigator.clipboard.writeText(qrQuery.data.surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('QRCodeModal.title')}
      description={t('QRCodeModal.description')}
      size="sm"
    >
      {qrQuery.isPending && (
        <div className={styles.center}>
          <Spinner />
        </div>
      )}

      {qrQuery.isError && <ErrorBanner error={qrQuery.error} onRetry={() => qrQuery.refetch()} />}

      {qrQuery.data && (
        <div className={styles.wrapper}>
          <img src={qrQuery.data.qrCodeDataUrl} alt={t('QRCodeModal.qrAlt')} className={styles.qrImage} />
          <div className={styles.urlRow}>
            <code className={styles.url}>{qrQuery.data.surveyUrl}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
            >
              {copied ? t('QRCodeModal.copied') : t('QRCodeModal.copy')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
