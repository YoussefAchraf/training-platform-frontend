import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Modal } from '@/shared/components/Modal';
import { useConversations } from '../hooks/useConversations';
import { useForwardMessage } from '../hooks/useForwardMessage';
import { useMessagingUiStore } from '../messagingUiStore';
import { conversationDisplayName, initialsFromName } from '../utils';
import styles from './ConversationsPane.module.css';

interface ForwardMessageModalProps {
  messageId: number;
  onClose: () => void;
}

export function ForwardMessageModal({ messageId, onClose }: ForwardMessageModalProps) {
  const { t } = useTranslation('messaging');
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const forwardMessage = useForwardMessage();
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);

  const handleForward = (targetConversationId: number) => {
    forwardMessage.mutate(
      { messageId, targetConversationId },
      {
        onSuccess: () => {
          selectConversation(targetConversationId);
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen onClose={onClose} title={t('MessageThread.forwardTo')} size="sm">
      {isLoading && <p className={styles.statusText}>{t('PeopleDirectory.loading')}</p>}
      {!isLoading && (!conversations || conversations.length === 0) && (
        <p className={styles.statusText}>{t('ConversationList.emptyState')}</p>
      )}
      <ul className={styles.list}>
        {conversations?.map((conversation) => {
          const name = conversationDisplayName(conversation, user?.id);
          return (
            <li key={conversation.id}>
              <button
                type="button"
                className={styles.conversationItem}
                disabled={forwardMessage.isPending}
                onClick={() => handleForward(conversation.id)}
              >
                <span className={styles.avatar}>{initialsFromName(name)}</span>
                <span className={styles.conversationDetails}>
                  <span className={styles.conversationName}>{name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
