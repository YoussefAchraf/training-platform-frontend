import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellOff, ChevronRight } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { EmptyState } from '@/shared/components/EmptyState';
import { cn } from '@/shared/utils/cn';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../hooks/useNotifications';
import styles from './NotificationsPanel.module.css';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}




export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { t } = useTranslation('pwa');
  const navigate = useNavigate();
  const { notifications, markAssignmentsSeen } = useNotifications();

  const dismiss = () => {
    const assignmentIds = notifications
      .filter((notification) => notification.id.startsWith('assignment-'))
      .map((notification) => Number(notification.id.replace('assignment-', '')));
    if (assignmentIds.length > 0) markAssignmentsSeen(assignmentIds);
    onClose();
  };

  const handleItemClick = (notification: AppNotification) => {
    navigate(notification.to);
    dismiss();
  };

  return (
    <Modal isOpen={isOpen} onClose={dismiss} title={t('PwaNotifications.title')} size="md">
      {notifications.length === 0 ? (
        <EmptyState icon={BellOff} title={t('PwaNotifications.emptyTitle')} description={t('PwaNotifications.emptyDescription')} />
      ) : (
        <ul className={styles.list}>
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button type="button" className={styles.item} onClick={() => handleItemClick(notification)}>
                <span className={cn(styles.iconWrap, styles[notification.tone])}>
                  <notification.icon size={18} />
                </span>
                <span className={styles.text}>
                  <span className={styles.itemTitle}>{notification.title}</span>
                  <span className={styles.itemDescription}>{notification.description}</span>
                </span>
                <ChevronRight size={16} className={styles.chevron} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
