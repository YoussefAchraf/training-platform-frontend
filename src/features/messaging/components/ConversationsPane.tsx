import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquareText, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';
import { useMessagingUiStore } from '../messagingUiStore';
import { ConversationList } from './ConversationList';
import { PeopleDirectory } from './PeopleDirectory';
import { GroupCreateModal } from './GroupCreateModal';
import styles from './ConversationsPane.module.css';

interface ConversationsPaneProps {
  onBack?: () => void;
}

export function ConversationsPane({ onBack }: ConversationsPaneProps) {
  const { t } = useTranslation('messaging');
  const { isManager } = useAuth();
  const activeTab = useMessagingUiStore((state) => state.activeTab);
  const setActiveTab = useMessagingUiStore((state) => state.setActiveTab);
  const groupModalOpen = useMessagingUiStore((state) => state.groupModalOpen);
  const setGroupModalOpen = useMessagingUiStore((state) => state.setGroupModalOpen);
  const [search, setSearch] = useState('');

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        {onBack && (
          <button type="button" className={styles.backButton} onClick={onBack} aria-label={t('MessagingPage.title')}>
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 id="tour-messages-header" className={styles.title}>
          {t('MessagingPage.title')}
        </h1>
        {isManager && (
          <button
            type="button"
            className={styles.newGroupButton}
            onClick={() => setGroupModalOpen(true)}
            aria-label={t('MessagingPage.createGroup')}
            title={t('MessagingPage.createGroup')}
          >
            <UserPlus size={18} />
          </button>
        )}
      </div>

      <div id="tour-messages-list" className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'conversations'}
          className={cn(styles.tab, activeTab === 'conversations' && styles.tabActive)}
          onClick={() => setActiveTab('conversations')}
        >
          <MessageSquareText size={16} />
          {t('MessagingPage.tabConversations')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'directory'}
          className={cn(styles.tab, activeTab === 'directory' && styles.tabActive)}
          onClick={() => setActiveTab('directory')}
        >
          <Users size={16} />
          {t('MessagingPage.tabDirectory')}
        </button>
      </div>

      {activeTab === 'directory' && (
        <div className={styles.searchWrap}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={t('PeopleDirectory.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}

      <div className={styles.body}>
        {activeTab === 'conversations' ? <ConversationList /> : <PeopleDirectory search={search} />}
      </div>

      {groupModalOpen && <GroupCreateModal onClose={() => setGroupModalOpen(false)} />}
    </div>
  );
}
