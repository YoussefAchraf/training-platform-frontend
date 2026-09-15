import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, CheckCheck, Clock, File as FileIcon, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { messagingApi } from '../api/messagingApi';
import { useMessagingUiStore } from '../messagingUiStore';
import type { ConversationParticipant, Message } from '../types';
import type { OptimisticMessage } from '../hooks/useSendMessage';
import { MessageActionsPopover } from './MessageActionsPopover';
import { MessageInfoPopover } from './MessageInfoPopover';
import styles from './MessageThread.module.css';

interface MessageBubbleProps {
  message: Message | OptimisticMessage;
  isOwn: boolean;
  participants: ConversationParticipant[];
  repliedToMessage: Message | OptimisticMessage | undefined;
  onReply: () => void;
  onForward: () => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentSrc(message: Message | OptimisticMessage): string {
  const optimistic = message as OptimisticMessage;
  if (optimistic.pending && optimistic.localPreviewUrl) return optimistic.localPreviewUrl;
  if (message.id > 0) return messagingApi.attachmentUrl(message.id);
  return optimistic.localPreviewUrl ?? '';
}

export function MessageBubble({ message, isOwn, participants, repliedToMessage, onReply, onForward }: MessageBubbleProps) {
  const { t } = useTranslation('messaging');
  const pending = 'pending' in message && message.pending;
  const failed = 'failed' in message && message.failed;
  const openActionsMessageId = useMessagingUiStore((state) => state.openActionsMessageId);
  const setOpenActionsMessageId = useMessagingUiStore((state) => state.setOpenActionsMessageId);
  const translatedText = useMessagingUiStore((state) => state.translations[message.id]);
  const isActionsOpen = openActionsMessageId === message.id;
  const [infoOpen, setInfoOpen] = useState(false);

  const canOpenActions = message.id > 0 && !failed;

  const handleBubbleClick = () => {
    if (!canOpenActions) return;
    setOpenActionsMessageId(isActionsOpen ? null : message.id);
  };

  const others = participants.filter((participant) => participant.userId !== message.senderId);
  const showTicks = isOwn && message.id > 0 && !pending && !failed && others.length > 0;
  const deliveredToAll = showTicks && others.every((p) => (p.lastDeliveredMessageId ?? 0) >= message.id);
  const readByAll = showTicks && others.every((p) => (p.lastReadMessageId ?? 0) >= message.id);

  return (
    <div className={cn(styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther)}>
      <div className={styles.messageBubbleWrap}>
        {isActionsOpen && (
          <MessageActionsPopover
            message={message}
            isOwn={isOwn}
            onClose={() => setOpenActionsMessageId(null)}
            onReply={onReply}
            onForward={onForward}
          />
        )}
        <button
          type="button"
          className={cn(
            styles.messageBubble,
            isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
            failed && styles.messageBubbleFailed,
          )}
          onClick={handleBubbleClick}
          disabled={!canOpenActions}
        >
          {repliedToMessage && (
            <div className={styles.quotedReply}>
              <span className={styles.quotedReplyName}>{repliedToMessage.senderName ?? ''}</span>
              <span className={styles.quotedReplyText}>
                {repliedToMessage.type === 'text' ? repliedToMessage.body : t(`MessageBubble.${repliedToMessage.type}Label` as 'MessageBubble.imageLabel')}
              </span>
            </div>
          )}

          {message.type === 'text' && <span className={styles.messageBody}>{message.body}</span>}

          {message.type === 'image' && (
            <img
              src={attachmentSrc(message)}
              alt={message.attachmentOriginalName ?? t('MessageBubble.imageLabel')}
              className={styles.messageImage}
              onClick={(event) => {
                event.stopPropagation();
                window.open(attachmentSrc(message), '_blank', 'noopener,noreferrer');
              }}
            />
          )}

          {message.type === 'voice' && (
            <audio
              controls
              src={attachmentSrc(message)}
              className={styles.messageAudio}
              onClick={(event) => event.stopPropagation()}
            />
          )}

          {message.type === 'file' && (
            <a
              href={attachmentSrc(message)}
              target="_blank"
              rel="noreferrer"
              className={styles.messageFile}
              onClick={(event) => event.stopPropagation()}
            >
              <FileIcon size={20} />
              <span className={styles.messageFileDetails}>
                <span className={styles.messageFileName}>{message.attachmentOriginalName ?? t('MessageBubble.fileLabel')}</span>
                {message.attachmentSizeBytes != null && (
                  <span className={styles.messageFileSize}>{formatSize(message.attachmentSizeBytes)}</span>
                )}
              </span>
            </a>
          )}

          {translatedText && (
            <div className={styles.translatedText}>
              <span className={styles.translatedTextLabel}>{t('MessageThread.translated')}</span>
              {translatedText}
            </div>
          )}

          <span className={styles.messageMeta}>
            {pending && <Clock size={11} />}
            {failed && <TriangleAlert size={11} />}
            <span>{failed ? t('MessageBubble.failed') : formatTime(message.createdAt)}</span>
            {showTicks && (
              <span
                className={styles.messageTickButton}
                role="button"
                tabIndex={0}
                aria-label={t('MessageInfoPopover.title')}
                onClick={(event) => {
                  event.stopPropagation();
                  setInfoOpen((open) => !open);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  event.stopPropagation();
                  setInfoOpen((open) => !open);
                }}
              >
                {readByAll ? (
                  <CheckCheck size={13} className={styles.messageTickRead} />
                ) : deliveredToAll ? (
                  <CheckCheck size={13} />
                ) : (
                  <Check size={13} />
                )}
              </span>
            )}
          </span>
        </button>

        {infoOpen && (
          <MessageInfoPopover message={message as Message} participants={participants} onClose={() => setInfoOpen(false)} />
        )}
      </div>
    </div>
  );
}
