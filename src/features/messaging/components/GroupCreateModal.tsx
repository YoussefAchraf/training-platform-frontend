import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { useDirectory } from '../hooks/useDirectory';
import { useCreateGroupConversation } from '../hooks/useCreateGroupConversation';
import { useMessagingUiStore } from '../messagingUiStore';
import { initialsFromName } from '../utils';
import styles from './ConversationsPane.module.css';

interface GroupCreateModalProps {
  onClose: () => void;
}

export function GroupCreateModal({ onClose }: GroupCreateModalProps) {
  const { t } = useTranslation('messaging');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: people, isLoading } = useDirectory(search);
  const createGroup = useCreateGroupConversation();
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);
  const setActiveTab = useMessagingUiStore((state) => state.setActiveTab);

  const instructors = (people ?? []).filter((person) => person.roleName === 'Instructor');

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || selectedIds.length === 0 || createGroup.isPending) return;
    createGroup.mutate(
      { name: name.trim(), memberUserIds: selectedIds },
      {
        onSuccess: (conversation) => {
          selectConversation(conversation.id);
          setActiveTab('conversations');
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen onClose={onClose} title={t('MessagingPage.createGroup')} size="sm">
      <form id="messaging-group-create-form" onSubmit={handleSubmit} className={styles.groupForm}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('MessagingPage.groupNamePlaceholder')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t('PeopleDirectory.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {isLoading && <p className={styles.statusText}>{t('PeopleDirectory.loading')}</p>}
        {!isLoading && instructors.length === 0 && <p className={styles.statusText}>{t('PeopleDirectory.emptyState')}</p>}

        <ul className={styles.list}>
          {instructors.map((person) => {
            const fullName = `${person.firstname} ${person.lastname}`;
            const checked = selectedIds.includes(person.id);
            return (
              <li key={person.id}>
                <label className={styles.groupMemberRow}>
                  <input type="checkbox" checked={checked} onChange={() => toggleSelected(person.id)} />
                  <span className={styles.avatar}>{initialsFromName(fullName)}</span>
                  <span className={styles.conversationName}>{fullName}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <Button
          type="submit"
          fullWidth
          isLoading={createGroup.isPending}
          disabled={!name.trim() || selectedIds.length === 0}
        >
          {t('MessagingPage.createGroupSubmit')}
        </Button>
      </form>
    </Modal>
  );
}
