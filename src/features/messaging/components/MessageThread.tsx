import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/utils/cn';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useMarkConversationRead } from '../hooks/useMarkConversationRead';
import { useTypingUsers, useRecordingUsers } from '../messagingRealtimeStore';
import { useMessagingUiStore } from '../messagingUiStore';
import { conversationDisplayName } from '../utils';
import type { Message } from '../types';
import type { OptimisticMessage } from '../hooks/useSendMessage';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { ForwardMessageModal } from './ForwardMessageModal';
import { ConversationInfoPanel } from './ConversationInfoPanel';
import styles from './MessageThread.module.css';

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
  const markRead = useMarkConversationRead();
  const typingUserIdsRaw = useTypingUsers(conversationId);
  const typingUserIds = typingUserIdsRaw.filter((id) => id !== user?.id);
  const recordingUserIdsRaw = useRecordingUsers(conversationId);
  const recordingUserIds = recordingUserIdsRaw.filter((id) => id !== user?.id);
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);
  const setReplyTarget = useMessagingUiStore((state) => state.setReplyTarget);
  const forwardMessageId = useMessagingUiStore((state) => state.forwardMessageId);
  const setForwardMessageId = useMessagingUiStore((state) => state.setForwardMessageId);
  const conversationInfoOpen = useMessagingUiStore((state) => state.conversationInfoOpen);
  const setConversationInfoOpen = useMessagingUiStore((state) => state.setConversationInfoOpen);

  const listRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages && messages.length > 0 ? messages[messages.length - 1].id : undefined;

  const messagesById = useMemo(() => {
    const map = new Map<number, Message | OptimisticMessage>();
    messages?.forEach((message) => map.set(message.id, message));
    return map;
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typingUserIds.length, recordingUserIds.length]);

  useEffect(() => {
    if (lastMessageId == null || lastMessageId < 0) return;
    markRead.mutate({ conversationId, messageId: lastMessageId });
  }, [conversationId, lastMessageId]);

  const name = conversation ? conversationDisplayName(conversation, user?.id) : '';
  const otherTyping = typingUserIds.length > 0;
  const otherRecording = !otherTyping && recordingUserIds.length > 0;

  const handleReply = (message: Message | OptimisticMessage) => {
    setReplyTarget(conversationId, {
      messageId: message.id,
      senderName: message.senderName ?? '',
      preview: message.type === 'text' ? (message.body ?? '') : t(`MessageBubble.${message.type}Label` as 'MessageBubble.imageLabel'),
    });
  };

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
        {conversation?.type === 'group' && (
          <button
            type="button"
            className={styles.infoButton}
            onClick={() => setConversationInfoOpen(true)}
            aria-label={t('MessageThread.groupInfo')}
          >
            <Info size={18} />
          </button>
        )}
      </div>

      <div className={styles.messages} ref={listRef}>
        {isLoading && <p className={styles.statusText}>{t('MessageThread.loading')}</p>}
        {!isLoading && (!messages || messages.length === 0) && (
          <p className={styles.statusText}>{t('MessageThread.emptyState')}</p>
        )}
        <motion.div variants={staggerContainer(0.03)} initial="hidden" animate="show">
          {messages?.map((message) => (
            <motion.div key={message.id < 0 ? `pending-${message.id}` : message.id} variants={listItem}>
              <MessageBubble
                message={message}
                isOwn={message.senderId === user?.id}
                repliedToMessage={message.replyToMessageId ? messagesById.get(message.replyToMessageId) : undefined}
                onReply={() => handleReply(message)}
                onForward={() => setForwardMessageId(message.id)}
              />
            </motion.div>
          ))}
        </motion.div>
        {(otherTyping || otherRecording) && (
          <div className={cn(styles.messageRow, styles.messageRowOther)}>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              {otherRecording && <span className={styles.recordingLabelInline}>{t('MessageThread.recordingLabel')}</span>}
            </div>
          </div>
        )}
      </div>

      <MessageComposer conversationId={conversationId} />

      {forwardMessageId != null && (
        <ForwardMessageModal messageId={forwardMessageId} onClose={() => setForwardMessageId(null)} />
      )}

      {conversationInfoOpen && conversation && (
        <ConversationInfoPanel conversation={conversation} onClose={() => setConversationInfoOpen(false)} />
      )}
    </div>
  );
}
