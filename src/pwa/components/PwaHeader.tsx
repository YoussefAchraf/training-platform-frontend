import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, GraduationCap, Menu } from 'lucide-react';
import { useUiStore } from '@/shared/store/uiStore';
import { TourButton } from '@/features/tour/TourButton';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationsPanel } from './NotificationsPanel';
import styles from './PwaHeader.module.css';

interface PwaHeaderProps {
  
  showMenuToggle?: boolean;
}

export function PwaHeader({ showMenuToggle = false }: PwaHeaderProps) {
  const { t } = useTranslation(['pwa', 'common']);
  const toggleDrawer = useUiStore((state) => state.toggleDrawer);
  const { totalCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <span className={styles.leftGroup}>
        {showMenuToggle && (
          <button type="button" className={styles.iconButton} onClick={toggleDrawer} aria-label={t('PwaHeader.openMenu')}>
            <Menu size={20} />
          </button>
        )}
        {}
        <span className={styles.brand}>
          <span className={styles.brandMark}>
            <GraduationCap size={16} />
          </span>
          <span className={styles.brandName}>{t('common:Nav.brand')}</span>
        </span>
      </span>

      <span className={styles.actions}>
        <TourButton />
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setNotificationsOpen(true)}
          aria-label={totalCount > 0 ? t('PwaHeader.notificationsCount', { count: totalCount }) : t('PwaHeader.notifications')}
        >
          <Bell size={19} />
          {totalCount > 0 && (
            <span className={styles.badge} aria-hidden="true">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </button>
      </span>

      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </header>
  );
}
