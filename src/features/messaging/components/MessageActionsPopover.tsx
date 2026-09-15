import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Forward, Languages, Pencil, Reply } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTranslateMessage } from '../hooks/useTranslateMessage';
import { useMessagingUiStore } from '../messagingUiStore';
import type { Message } from '../types';
import styles from './MessageThread.module.css';

interface MessageActionsPopoverProps {
  message: Message;
  isOwn: boolean;
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
  onEdit: () => void;
}

export function MessageActionsPopover({ message, isOwn, onClose, onReply, onForward, onEdit }: MessageActionsPopoverProps) {
  const { t, i18n } = useTranslation('messaging');
  const translateMessage = useTranslateMessage();
  const translations = useMessagingUiStore((state) => state.translations);
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

  const canTranslate = message.type === 'text' && Boolean(message.body);
  const alreadyTranslated = Boolean(translations[message.id]);
  const canEdit = isOwn && message.type === 'text';

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.actionsPopover,
        isOwn ? styles.actionsPopoverOwn : styles.actionsPopoverOther,
        placement === 'below' && styles.actionsPopoverBelow,
      )}
    >
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
    </div>
  );
}
