import { CalendarClock, MapPin, UserCog, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { assignmentStatusMeta, sessionStatusMeta, type Tone } from '@/shared/utils/statusMeta';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { fadeInUp } from '@/shared/motion/variants';
import type { TrainingSession } from '@/shared/types/domain';
import styles from './SessionCard.module.css';



const TONE_VAR: Record<Tone, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  neutral: 'var(--color-neutral)',
};

interface SessionCardProps {
  session: TrainingSession;
  trainingName: string;
  clientName: string;
  clientCountry: string | null;
  instructorName: string | null;
  showInstructor: boolean;
  onClick: () => void;
}

export function SessionCard({ session, trainingName, clientName, clientCountry, instructorName, showInstructor, onClick }: SessionCardProps) {
  const { t } = useTranslation('sessions');
  const statusMeta = sessionStatusMeta[session.sessionStatus];
  const assignmentMeta = assignmentStatusMeta[session.assignmentStatus];

  return (
    <Card interactive className={styles.card} onClick={onClick} variants={fadeInUp}>
      <span className={styles.accent} style={{ backgroundColor: TONE_VAR[statusMeta.tone] }} aria-hidden="true" />

      <div className={styles.topRow}>
        <Badge tone={statusMeta.tone} pulse={statusMeta.pulse}>
          {t(statusMeta.labelKey)}
        </Badge>
        <Badge tone={session.locationType === 'remote' ? 'info' : 'neutral'}>
          {session.locationType === 'remote' ? <Video size={12} /> : <MapPin size={12} />}
          {t(`SessionsPage.${session.locationType}`)}
        </Badge>
      </div>

      <h3 className={styles.title}>{trainingName}</h3>

      <p className={styles.client}>
        <CountryFlag code={clientCountry} className={styles.flag} />
        {clientName}
      </p>

      <div className={styles.metaList}>
        <span className={styles.metaItem}>
          <CalendarClock size={14} aria-hidden="true" />
          {formatDateTime(session.startDate)}
        </span>
        {showInstructor && (
          <span className={styles.metaItem}>
            <UserCog size={14} aria-hidden="true" />
            {instructorName ?? t('SessionsPage.unassigned')}
          </span>
        )}
      </div>

      {/* "Accepted" isn't shown - assignment here is automatic (Manager/Sales
          just pick an instructor, there's no real accept/decline step to
          call out), so the only assignment states worth a badge are the
          ones that actually need someone's attention. */}
      {session.assignmentStatus !== 'accepted' && (
        <div className={styles.footer}>
          <Badge tone={assignmentMeta.tone} pulse={assignmentMeta.pulse}>
            {t(assignmentMeta.labelKey)}
          </Badge>
        </div>
      )}
    </Card>
  );
}
