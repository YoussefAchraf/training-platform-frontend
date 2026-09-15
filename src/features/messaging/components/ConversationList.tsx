import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';
import { useConversations } from '../hooks/useConversations';
import { useMessagingUiStore } from '../messagingUiStore';
import type { Conversation } from '../types';
import styles from './ConversationsPane.module.css';

function conversationDisplayName(conversation: Conversation, currentUserId: number | undefined): string {
  if (conversation.type === 'group') return conversation.name || '';
  const other = conversation.participants.find((participant) => participant.userId !== currentUserId);
  return other ? `${other.firstname ?? ''} ${other.lastname ?? ''}`.trim() : '';
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ConversationList() {
  const { t } = useTranslation(['messaging', 'common']);
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const selectedConversationId = useMessagingUiStore((state) => state.selectedConversationId);
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);

  if (isLoading) {
    return <p className={styles.statusText}>{t('PeopleDirectory.loading')}</p>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{t('ConversationList.emptyState')}</p>
        <p className={styles.emptyStateHint}>{t('ConversationList.emptyStateHint')}</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {conversations.map((conversation) => {
        const name = conversationDisplayName(conversation, user?.id);
        const isUnread = conversation.unreadCount > 0;
        const lastMessage = conversation.lastMessage;
        const preview = lastMessage
          ? lastMessage.type === 'text'
            ? lastMessage.body
            : t(`MessageBubble.${lastMessage.type}Label` as 'MessageBubble.imageLabel')
          : t('ConversationList.noMessagesYet');

        return (
          <li key={conversation.id}>
            <button
              type="button"
              className={cn(
                styles.conversationItem,
                isUnread && styles.conversationItemUnread,
                selectedConversationId === conversation.id && styles.conversationItemActive,
              )}
              onClick={() => selectConversation(conversation.id)}
            >
              <span className={styles.avatar}>{initials(name)}</span>
              <span className={styles.conversationDetails}>
                <span className={styles.conversationName}>{name}</span>
                <span className={styles.conversationPreview}>{preview}</span>
              </span>
              {isUnread && (
                <span
                  className={styles.unreadBadge}
                  aria-label={t('common:Nav.unreadMessagesBadge', { count: conversation.unreadCount })}
                >
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
