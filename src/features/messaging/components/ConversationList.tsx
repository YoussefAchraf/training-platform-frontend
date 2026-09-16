import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BellOff, Bell, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/utils/cn';
import { useConversations } from '../hooks/useConversations';
import { useHideConversation } from '../hooks/useHideConversation';
import { useSetConversationMuted } from '../hooks/useSetConversationMuted';
import { useMessagingUiStore } from '../messagingUiStore';
import { conversationDisplayName, initialsFromName } from '../utils';
import styles from './ConversationsPane.module.css';

export function ConversationList() {
  const { t } = useTranslation(['messaging', 'common']);
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const selectedConversationId = useMessagingUiStore((state) => state.selectedConversationId);
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);
  const hideConversation = useHideConversation();
  const setConversationMuted = useSetConversationMuted();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openMenuId == null) return undefined;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

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
        const isMuted = Boolean(
          conversation.participants.find((participant) => participant.userId === user?.id)?.mutedAt,
        );
        const preview = lastMessage
          ? lastMessage.deletedAt
            ? t('MessageBubble.deletedForEveryone')
            : lastMessage.type === 'text'
              ? lastMessage.body
              : t(`MessageBubble.${lastMessage.type}Label` as 'MessageBubble.imageLabel')
          : t('ConversationList.noMessagesYet');

        return (
          <li key={conversation.id} className={styles.conversationListItem}>
            <div className={styles.conversationRow}>
              <button
                type="button"
                className={cn(
                  styles.conversationItem,
                  isUnread && styles.conversationItemUnread,
                  selectedConversationId === conversation.id && styles.conversationItemActive,
                )}
                onClick={() => selectConversation(conversation.id)}
              >
                <span className={styles.avatar}>{initialsFromName(name)}</span>
                <span className={styles.conversationDetails}>
                  <span className={styles.conversationName}>
                    {name}
                    {isMuted && <BellOff size={12} className={styles.mutedIcon} />}
                  </span>
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
              <span
                role="button"
                tabIndex={0}
                className={styles.conversationMoreButton}
                aria-label={t('ConversationList.moreOptions')}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId((current) => (current === conversation.id ? null : conversation.id));
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  event.stopPropagation();
                  setOpenMenuId((current) => (current === conversation.id ? null : conversation.id));
                }}
              >
                <MoreVertical size={16} />
              </span>

              {openMenuId === conversation.id && (
                <div ref={menuRef} className={styles.conversationMenu}>
                  <button
                    type="button"
                    className={styles.conversationMenuItem}
                    disabled={setConversationMuted.isPending}
                    onClick={() => {
                      setConversationMuted.mutate({ conversationId: conversation.id, muted: !isMuted });
                      setOpenMenuId(null);
                    }}
                  >
                    {isMuted ? <Bell size={15} /> : <BellOff size={15} />}
                    {isMuted ? t('ConversationList.unmute') : t('ConversationList.mute')}
                  </button>
                  <button
                    type="button"
                    className={cn(styles.conversationMenuItem, styles.conversationMenuItemDanger)}
                    onClick={() => {
                      setDeleteTargetId(conversation.id);
                      setOpenMenuId(null);
                    }}
                  >
                    <Trash2 size={15} />
                    {t('ConversationList.deleteConversation')}
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}

      {deleteTargetId != null && (
        <ConfirmDialog
          isOpen
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => {
            hideConversation.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
          }}
          title={t('ConversationList.deleteConversationConfirmTitle')}
          description={t('ConversationList.deleteConversationConfirmDescription')}
          confirmLabel={t('ConversationList.deleteConversation')}
          tone="danger"
          isLoading={hideConversation.isPending}
        />
      )}
    </ul>
  );
}
