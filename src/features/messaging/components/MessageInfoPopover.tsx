import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatDateTime } from '../utils';
import type { ConversationParticipant, Message } from '../types';
import styles from './MessageThread.module.css';

interface MessageInfoPopoverProps {
  message: Message;
  participants: ConversationParticipant[];
  onClose: () => void;
}

export function MessageInfoPopover({ message, participants, onClose }: MessageInfoPopoverProps) {
  const { t } = useTranslation('messaging');
  const containerRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<'above' | 'below'>('above');

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0) {
      setPlacement('below');
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const others = participants.filter((participant) => participant.userId !== message.senderId);

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.actionsPopover,
        styles.actionsPopoverOwn,
        styles.messageInfoPopover,
        placement === 'below' && styles.actionsPopoverBelow,
      )}
    >
      <span className={styles.messageInfoTitle}>{t('MessageInfoPopover.title')}</span>
      <ul className={styles.messageInfoList}>
        {others.map((participant) => {
          const name = `${participant.firstname ?? ''} ${participant.lastname ?? ''}`.trim();
          const isRead = participant.lastReadMessageId != null && participant.lastReadMessageId >= message.id;
          const isDelivered =
            participant.lastDeliveredMessageId != null && participant.lastDeliveredMessageId >= message.id;

          return (
            <li key={participant.userId} className={styles.messageInfoRow}>
              <span className={styles.messageInfoName}>{name}</span>
              <span className={styles.messageInfoStatus}>
                {isRead && participant.lastReadAt && (
                  <>
                    <CheckCheck size={13} className={styles.messageInfoReadIcon} />
                    {t('MessageInfoPopover.readAt', { time: formatDateTime(participant.lastReadAt) })}
                  </>
                )}
                {!isRead && isDelivered && participant.lastDeliveredAt && (
                  <>
                    <CheckCheck size={13} />
                    {t('MessageInfoPopover.deliveredAt', { time: formatDateTime(participant.lastDeliveredAt) })}
                  </>
                )}
                {!isRead && !isDelivered && (
                  <>
                    <Check size={13} />
                    {t('MessageInfoPopover.sent')}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
