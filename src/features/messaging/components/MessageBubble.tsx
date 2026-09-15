import { useTranslation } from 'react-i18next';
import { Clock, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { Message } from '../types';
import type { OptimisticMessage } from '../hooks/useSendMessage';
import styles from './MessageThread.module.css';

interface MessageBubbleProps {
  message: Message | OptimisticMessage;
  isOwn: boolean;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { t } = useTranslation('messaging');
  const pending = 'pending' in message && message.pending;
  const failed = 'failed' in message && message.failed;

  const content =
    message.type === 'text'
      ? message.body
      : t(`MessageBubble.${message.type}Label` as 'MessageBubble.imageLabel');

  return (
    <div className={cn(styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther)}>
      <div
        className={cn(
          styles.messageBubble,
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
          failed && styles.messageBubbleFailed,
        )}
      >
        <span className={styles.messageBody}>{content}</span>
        <span className={styles.messageMeta}>
          {pending && <Clock size={11} />}
          {failed && <TriangleAlert size={11} />}
          <span>{failed ? t('MessageBubble.failed') : formatTime(message.createdAt)}</span>
        </span>
      </div>
    </div>
  );
}
