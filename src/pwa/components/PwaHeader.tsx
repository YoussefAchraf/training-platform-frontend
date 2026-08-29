import { useTranslation } from 'react-i18next';
import { UserMenu } from '@/layouts/components/UserMenu';
import { TourButton } from '@/features/tour/TourButton';
import styles from './PwaHeader.module.css';




export function PwaHeader() {
  const { i18n } = useTranslation();
  const weekdayFormatter = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className={styles.header}>
      <span className={styles.date}>{weekdayFormatter.format(new Date())}</span>
      <span className={styles.actions}>
        <TourButton />
        <UserMenu placement="down" variant="compact" />
      </span>
    </header>
  );
}
