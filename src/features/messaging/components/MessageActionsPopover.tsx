import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Forward, Languages, Pencil, Reply, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTranslateMessage } from '../hooks/useTranslateMessage';
import { useDeleteMessage } from '../hooks/useDeleteMessage';
import { useMessagingUiStore } from '../messagingUiStore';
import type { Message } from '../types';
import { AnchoredPopover } from './AnchoredPopover';
import styles from './MessageThread.module.css';

const DELETE_FOR_EVERYONE_WINDOW_MS = 2 * 60 * 1000;
const DELETE_WINDOW_CHECK_INTERVAL_MS = 5000;

interface MessageActionsPopoverProps {
  message: Message;
  isOwn: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
  onEdit: () => void;
}

export function MessageActionsPopover({ message, isOwn, anchorRef, onClose, onReply, onForward, onEdit }: MessageActionsPopoverProps) {
  const { t, i18n } = useTranslation('messaging');
  const translateMessage = useTranslateMessage();
  const deleteMessage = useDeleteMessage();
  const translations = useMessagingUiStore((state) => state.translations);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!showDeleteOptions || !isOwn) return undefined;
    const interval = setInterval(() => setNow(Date.now()), DELETE_WINDOW_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [showDeleteOptions, isOwn]);

  const canTranslate = message.type === 'text' && Boolean(message.body);
  const alreadyTranslated = Boolean(translations[message.id]);
  const canEdit = isOwn && message.type === 'text';
  const canDeleteForEveryone = isOwn && now - new Date(message.createdAt).getTime() < DELETE_FOR_EVERYONE_WINDOW_MS;

  const handleDelete = (scope: 'me' | 'everyone') => {
    deleteMessage.mutate({ messageId: message.id, conversationId: message.conversationId, scope });
    onClose();
  };

  return (
    <AnchoredPopover anchorRef={anchorRef} align={isOwn ? 'own' : 'other'} onClose={onClose} className={styles.actionsPopover}>
      {!showDeleteOptions && (
        <>
          {canTranslate && (
            <button
              type="button"
              className={styles.actionsPopoverItem}
              disabled={translateMessage.isPending}
              onClick={() => {
                translateMessage.mutate({ messageId: message.id, targetLanguage: i18n.language });
                onClose();
              }}
            >
              <Languages size={15} />
              {alreadyTranslated ? t('MessageThread.translateAgain') : t('MessageThread.translate')}
            </button>
          )}
          <button
            type="button"
            className={styles.actionsPopoverItem}
            onClick={() => {
              onReply();
              onClose();
            }}
          >
            <Reply size={15} />
            {t('MessageThread.reply')}
          </button>
          {canEdit && (
            <button
              type="button"
              className={styles.actionsPopoverItem}
              onClick={() => {
                onEdit();
                onClose();
              }}
            >
              <Pencil size={15} />
              {t('MessageThread.edit')}
            </button>
          )}
          <button
            type="button"
            className={styles.actionsPopoverItem}
            onClick={() => {
              onForward();
              onClose();
            }}
          >
            <Forward size={15} />
            {t('MessageThread.forward')}
          </button>
          <button
            type="button"
            className={cn(styles.actionsPopoverItem, styles.actionsPopoverItemDanger)}
            onClick={() => setShowDeleteOptions(true)}
          >
            <Trash2 size={15} />
            {t('MessageThread.delete')}
          </button>
        </>
      )}

      {showDeleteOptions && (
        <>
          <button
            type="button"
            className={cn(styles.actionsPopoverItem, styles.actionsPopoverItemDanger)}
            disabled={deleteMessage.isPending}
            onClick={() => handleDelete('me')}
          >
            <Trash2 size={15} />
            {t('MessageThread.deleteForMe')}
          </button>
          {canDeleteForEveryone && (
            <button
              type="button"
              className={cn(styles.actionsPopoverItem, styles.actionsPopoverItemDanger)}
              disabled={deleteMessage.isPending}
              onClick={() => handleDelete('everyone')}
            >
              <Trash2 size={15} />
              {t('MessageThread.deleteForEveryone')}
            </button>
          )}
          <button type="button" className={styles.actionsPopoverItem} onClick={() => setShowDeleteOptions(false)}>
            {t('MessageThread.cancelDelete')}
          </button>
        </>
      )}
    </AnchoredPopover>
  );
}
