import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { CertificationStatusPill } from '@/shared/components/CertificationStatusPill';
import { getCertificationExpiryStatus } from '@/shared/utils/certificationExpiry';
import styles from './PwaTrainingCertSheet.module.css';

interface PwaTrainingCertSheetProps {
  isOpen: boolean;
  trainingName: string;
  certificateId: string;
  certificateExpiresAt: string;
  onClose: () => void;
  onSave: (certificateId: string, certificateExpiresAt: string) => void;
}








export function PwaTrainingCertSheet({
  isOpen,
  trainingName,
  certificateId,
  certificateExpiresAt,
  onClose,
  onSave,
}: PwaTrainingCertSheetProps) {
  const { t } = useTranslation('instructors');
  const [localId, setLocalId] = useState(certificateId);
  const [localExpiresAt, setLocalExpiresAt] = useState(certificateExpiresAt);

  useEffect(() => {
    if (isOpen) {
      setLocalId(certificateId);
      setLocalExpiresAt(certificateExpiresAt);
    }
  }, [isOpen, certificateId, certificateExpiresAt]);

  const status = getCertificationExpiryStatus(localExpiresAt || null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={trainingName}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('EditInstructorModal.cancel')}
          </Button>
          <Button onClick={() => onSave(localId, localExpiresAt)}>{t('InstructorProfileForm.saveChanges')}</Button>
        </>
      }
    >
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('InstructorProfileForm.certificateIdLabel')}</span>
          <Input
            type="text"
            value={localId}
            onChange={(event) => setLocalId(event.target.value)}
            placeholder={t('InstructorProfileForm.certificateIdPlaceholder')}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('InstructorProfileForm.certificateExpiresLabel')}</span>
          <Input type="date" value={localExpiresAt} onChange={(event) => setLocalExpiresAt(event.target.value)} />
        </label>
        {status !== 'none' && (
          <CertificationStatusPill status={status} className={styles.statusPill}>
            {status === 'expired' ? t('InstructorProfileForm.certificateExpired') : t('InstructorProfileForm.certificateExpiringSoon')}
          </CertificationStatusPill>
        )}
      </div>
    </Modal>
  );
}
