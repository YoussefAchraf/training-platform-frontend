import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Check, CheckCheck, Clock, File as FileIcon, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { messagingApi } from '../api/messagingApi';
import { retryOutboxEntry } from '../outbox/outboxEngine';
import { useMessagingUiStore } from '../messagingUiStore';
import type { ConversationParticipant, Message } from '../types';
import type { OptimisticMessage } from '../hooks/useSendMessage';
import { MessageActionsPopover } from './MessageActionsPopover';
import { MessageInfoPopover } from './MessageInfoPopover';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import styles from './MessageThread.module.css';

interface MessageBubbleProps {
  message: Message | OptimisticMessage;
  isOwn: boolean;
  participants: ConversationParticipant[];
  repliedToMessage: Message | OptimisticMessage | undefined;
  onReply: () => void;
  onForward: () => void;
  onEdit: () => void;
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

export function MessageBubble({ message, isOwn, participants, repliedToMessage, onReply, onForward, onEdit }: MessageBubbleProps) {
  const { t } = useTranslation('messaging');
  const pending = 'pending' in message && message.pending;
  const failed = 'failed' in message && message.failed;
  const uploadProgress = 'uploadProgress' in message ? message.uploadProgress : undefined;
  const uploadStatus = 'uploadStatus' in message ? message.uploadStatus : undefined;
  const showUploadBar = pending && message.type !== 'text' && uploadProgress !== undefined;
  const openActionsMessageId = useMessagingUiStore((state) => state.openActionsMessageId);
  const setOpenActionsMessageId = useMessagingUiStore((state) => state.setOpenActionsMessageId);
  const translatedText = useMessagingUiStore((state) => state.translations[message.id]);
  const isActionsOpen = openActionsMessageId === message.id;
  const [infoOpen, setInfoOpen] = useState(false);
  const isDeleted = Boolean(message.deletedAt);

  const canOpenActions = message.id > 0 && !failed && !isDeleted;
  const canRetry = failed && 'clientId' in message;

  const handleBubbleClick = () => {
    if (canRetry) {
      retryOutboxEntry((message as OptimisticMessage).clientId);
      return;
    }
    if (!canOpenActions) return;
    setOpenActionsMessageId(isActionsOpen ? null : message.id);
  };

  const others = participants.filter((participant) => participant.userId !== message.senderId);
  const showTicks = isOwn && message.id > 0 && !pending && !failed && !isDeleted && others.length > 0;
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
            onEdit={onEdit}
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
          disabled={!canOpenActions && !canRetry}
          aria-label={canRetry ? t('MessageBubble.retry') : undefined}
        >
          {isDeleted && (
            <span className={styles.deletedBody}>
              <Ban size={14} />
              {t('MessageBubble.deletedForEveryone')}
            </span>
          )}

          {!isDeleted && repliedToMessage && (
            <div className={styles.quotedReply}>
              <span className={styles.quotedReplyName}>{repliedToMessage.senderName ?? ''}</span>
              <span className={styles.quotedReplyText}>
                {repliedToMessage.type === 'text' ? repliedToMessage.body : t(`MessageBubble.${repliedToMessage.type}Label` as 'MessageBubble.imageLabel')}
              </span>
            </div>
          )}

          {!isDeleted && message.type === 'text' && <span className={styles.messageBody}>{message.body}</span>}

          {!isDeleted && message.type === 'image' && (
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

          {!isDeleted && message.type === 'voice' && (
            <VoiceMessagePlayer
              src={attachmentSrc(message)}
              storedDurationSeconds={message.attachmentDurationSeconds}
              isOwn={isOwn}
            />
          )}

          {!isDeleted && message.type === 'file' && (
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

          {!isDeleted && showUploadBar && (
            <div className={styles.uploadProgress}>
              <div className={styles.uploadProgressTrack}>
                <div className={styles.uploadProgressFill} style={{ width: `${Math.round((uploadProgress ?? 0) * 100)}%` }} />
              </div>
              <span className={styles.uploadProgressLabel}>
                {uploadStatus === 'paused'
                  ? t('MessageBubble.uploadPaused')
                  : uploadStatus === 'completing'
                    ? t('MessageBubble.uploadCompleting')
                    : t('MessageBubble.uploadingPercent', { percent: Math.round((uploadProgress ?? 0) * 100) })}
              </span>
            </div>
          )}

          {!isDeleted && translatedText && (
            <div className={styles.translatedText}>
              <span className={styles.translatedTextLabel}>{t('MessageThread.translated')}</span>
              {translatedText}
            </div>
          )}

          <span className={styles.messageMeta}>
            {pending && <Clock size={11} />}
            {failed && <TriangleAlert size={11} />}
            {message.editedAt && !pending && !failed && !isDeleted && (
              <span className={styles.editedLabel}>{t('MessageBubble.edited')}</span>
            )}
            <span>{failed ? t('MessageBubble.failedTapToRetry') : formatTime(message.createdAt)}</span>
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
