import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatDateTime } from '../utils';
import type { ConversationParticipant, Message } from '../types';
import { AnchoredPopover } from './AnchoredPopover';
import styles from './MessageThread.module.css';

interface MessageInfoPopoverProps {
  message: Message;
  participants: ConversationParticipant[];
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export function MessageInfoPopover({ message, participants, anchorRef, onClose }: MessageInfoPopoverProps) {
  const { t } = useTranslation('messaging');
  const others = participants.filter((participant) => participant.userId !== message.senderId);

  return (
    <AnchoredPopover anchorRef={anchorRef} align="own" onClose={onClose} className={cn(styles.actionsPopover, styles.messageInfoPopover)}>
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
    </AnchoredPopover>
  );
}
