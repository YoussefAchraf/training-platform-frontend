import { useTranslation } from 'react-i18next';
import { useDirectory } from '../hooks/useDirectory';
import { useCreateDirectConversation } from '../hooks/useCreateDirectConversation';
import { useMessagingUiStore } from '../messagingUiStore';
import type { DirectoryPerson } from '../types';
import styles from './ConversationsPane.module.css';

function initials(person: DirectoryPerson): string {
  return `${person.firstname[0] ?? ''}${person.lastname[0] ?? ''}`.toUpperCase();
}

interface PeopleDirectoryProps {
  search: string;
}

export function PeopleDirectory({ search }: PeopleDirectoryProps) {
  const { t } = useTranslation('messaging');
  const { data: people, isLoading } = useDirectory(search);
  const createDirectConversation = useCreateDirectConversation();
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);
  const setActiveTab = useMessagingUiStore((state) => state.setActiveTab);

  const handleSelect = (person: DirectoryPerson) => {
    createDirectConversation.mutate(person.id, {
      onSuccess: (conversation) => {
        selectConversation(conversation.id);
        setActiveTab('conversations');
      },
    });
  };

  if (isLoading) {
    return <p className={styles.statusText}>{t('PeopleDirectory.loading')}</p>;
  }

  if (!people || people.length === 0) {
    return <p className={styles.statusText}>{t('PeopleDirectory.emptyState')}</p>;
  }

  return (
    <ul className={styles.list}>
      {people.map((person) => (
        <li key={person.id}>
          <button
            type="button"
            className={styles.conversationItem}
            onClick={() => handleSelect(person)}
            disabled={createDirectConversation.isPending}
          >
            <span className={styles.avatar}>{initials(person)}</span>
            <span className={styles.conversationDetails}>
              <span className={styles.conversationName}>
                {person.firstname} {person.lastname}
              </span>
              <span className={styles.conversationPreview}>{person.roleName}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
