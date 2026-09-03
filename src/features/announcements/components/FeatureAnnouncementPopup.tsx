import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { StarRating } from '@/shared/components/StarRating';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMyPendingAnnouncements, useRateAnnouncement } from '../hooks/useAnnouncements';
import styles from './FeatureAnnouncementPopup.module.css';


export function FeatureAnnouncementPopup() {
  const { t } = useTranslation('feedback');
  const { isAuthenticated, isDeveloper } = useAuth();
  const enabled = isAuthenticated && !isDeveloper;
  const { data: announcements } = useMyPendingAnnouncements(enabled);
  const rate = useRateAnnouncement();
  const titleId = useId();

  const [index, setIndex] = useState(0);
  const [hasRatedCurrent, setHasRatedCurrent] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);

  const current = announcements?.[index];

  
  useEffect(() => {
    setHasRatedCurrent(false);
    setSelectedStars(0);
  }, [current?.id]);

  if (!current) return null;

  const total = announcements!.length;
  const isLast = index === total - 1;

  const handleRate = (stars: number) => {
    setSelectedStars(stars);
    rate.mutate(
      { id: current.id, stars },
      {
        onSuccess: () => setHasRatedCurrent(true),
      },
    );
  };

  const handleAdvance = () => setIndex((value) => value + 1);

  return (
    <Modal
      isOpen
      onClose={() => {}}
      dismissible={false}
      size="md"
      title={t('FeatureAnnouncementPopup.badge')}
      description={t('FeatureAnnouncementPopup.progress', { current: index + 1, total })}
      footer={
        <Button onClick={handleAdvance} disabled={!hasRatedCurrent} isLoading={rate.isPending} fullWidth>
          {isLast ? t('FeatureAnnouncementPopup.done') : t('FeatureAnnouncementPopup.next')}
        </Button>
      }
    >
      <div className={styles.body}>
        <Badge tone="info" className={styles.badge}>
          <Sparkles size={13} />
          <span>{t('FeatureAnnouncementPopup.badge')}</span>
        </Badge>

        <h3 id={titleId} className={styles.title}>
          {current.title}
        </h3>
        <p className={styles.description}>{current.description}</p>

        <div className={styles.ratingBlock}>
          <p className={styles.ratingPrompt}>{t('FeatureAnnouncementPopup.ratingPrompt')}</p>
          <StarRating value={selectedStars} onChange={handleRate} size={32} label={current.title} />
          {!hasRatedCurrent && <p className={styles.hint}>{t('FeatureAnnouncementPopup.ratingRequiredHint')}</p>}
        </div>
      </div>
    </Modal>
  );
}
