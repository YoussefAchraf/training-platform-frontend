import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Video } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { formatDateTime, formatTime } from '@/shared/utils/formatDate';
import { paths } from '@/routes/paths';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import type { TrainingSession } from '@/shared/types/domain';
import styles from './NewAssignmentsModal.module.css';

interface NewAssignmentsModalProps {
  sessions: TrainingSession[];
  onClose: () => void;
}





export function NewAssignmentsModal({ sessions, onClose }: NewAssignmentsModalProps) {
  const { t } = useTranslation('calendar');
  const { trainingMap, clientMap } = useSessionLookups();

  return (
    <Modal
      isOpen={sessions.length > 0}
      onClose={onClose}
      title={t('NewAssignmentsModal.title', { count: sessions.length })}
      description={t('NewAssignmentsModal.description', { count: sessions.length })}
      size="md"
      footer={
        <Button onClick={onClose} fullWidth>
          {t('NewAssignmentsModal.gotIt')}
        </Button>
      }
    >
      <ul className={styles.list}>
        {sessions.map((session) => (
          <li key={session.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <p className={styles.trainingName}>
                {trainingMap.get(session.trainingId)?.name ?? t('NewAssignmentsModal.unnamedSession', { id: session.id })}
              </p>
              <Badge tone={session.locationType === 'remote' ? 'info' : 'neutral'}>
                {session.locationType === 'remote' ? <Video size={12} /> : <MapPin size={12} />}
                {t(`NewAssignmentsModal.${session.locationType}`)}
              </Badge>
            </div>
            <p className={styles.clientName}>{clientMap.get(session.clientId)?.companyName ?? t('NewAssignmentsModal.unknownClient')}</p>
            <p className={styles.timeRange}>
              {formatDateTime(session.startDate)} – {formatTime(session.endDate)}
            </p>
            <Link to={paths.sessionDetail(session.id)} className={styles.viewLink} onClick={onClose}>
              {t('NewAssignmentsModal.viewSession')}
            </Link>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
