import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/utils/cn';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { useMarkConversationRead } from '../hooks/useMarkConversationRead';
import { useTypingBroadcast } from '../hooks/useTypingBroadcast';
import { useTypingUsers } from '../messagingRealtimeStore';
import { useMessagingUiStore } from '../messagingUiStore';
import type { Conversation } from '../types';
import { MessageBubble } from './MessageBubble';
import styles from './MessageThread.module.css';

function conversationDisplayName(conversation: Conversation, currentUserId: number | undefined): string {
  if (conversation.type === 'group') return conversation.name || '';
  const other = conversation.participants.find((participant) => participant.userId !== currentUserId);
  return other ? `${other.firstname ?? ''} ${other.lastname ?? ''}`.trim() : '';
}

interface MessageThreadProps {
  conversationId: number;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { t } = useTranslation(['messaging', 'common']);
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const { data: conversations } = useConversations();
  const conversation = conversations?.find((item) => item.id === conversationId);
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();
  const { notifyTyping, stopTyping } = useTypingBroadcast(conversationId);
  const typingUserIdsRaw = useTypingUsers(conversationId);
  const typingUserIds = typingUserIdsRaw.filter((id) => id !== user?.id);
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);
  const setDraft = useMessagingUiStore((state) => state.setDraft);
  const draft = useMessagingUiStore((state) => state.drafts[conversationId] ?? '');

  const listRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages && messages.length > 0 ? messages[messages.length - 1].id : undefined;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typingUserIds.length]);

  useEffect(() => {
    if (lastMessageId == null || lastMessageId < 0) return;
    markRead.mutate({ conversationId, messageId: lastMessageId });
  }, [conversationId, lastMessageId]);

  const name = conversation ? conversationDisplayName(conversation, user?.id) : '';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sendMessage.isPending) return;
    setDraft(conversationId, '');
    stopTyping();
    sendMessage.mutate({ body: trimmed, clientId: crypto.randomUUID() });
  };

  const otherTyping = typingUserIds.length > 0;

  return (
    <div className={styles.thread}>
      <div className={styles.header}>
        {!isDesktop && (
          <button
            type="button"
            className={styles.backButton}
            onClick={() => selectConversation(null)}
            aria-label={t('common:Nav.mainNavigation')}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <span className={styles.headerName}>{name}</span>
      </div>

      <div className={styles.messages} ref={listRef}>
        {isLoading && <p className={styles.statusText}>{t('MessageThread.loading')}</p>}
        {!isLoading && (!messages || messages.length === 0) && (
          <p className={styles.statusText}>{t('MessageThread.emptyState')}</p>
        )}
        <motion.div variants={staggerContainer(0.03)} initial="hidden" animate="show">
          {messages?.map((message) => (
            <motion.div key={message.id < 0 ? `pending-${message.id}` : message.id} variants={listItem}>
              <MessageBubble message={message} isOwn={message.senderId === user?.id} />
            </motion.div>
          ))}
        </motion.div>
        {otherTyping && (
          <div className={cn(styles.messageRow, styles.messageRowOther)}>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
            </div>
          </div>
        )}
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder={t('MessageThread.placeholder')}
          value={draft}
          onChange={(event) => {
            setDraft(conversationId, event.target.value);
            if (event.target.value.trim()) notifyTyping();
            else stopTyping();
          }}
          aria-label={t('MessageThread.placeholder')}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!draft.trim() || sendMessage.isPending}
          aria-label={t('MessageThread.send')}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
