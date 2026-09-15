import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Crown, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Modal } from '@/shared/components/Modal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDirectory } from '../hooks/useDirectory';
import { useAddParticipant } from '../hooks/useAddParticipant';
import { useRemoveParticipant } from '../hooks/useRemoveParticipant';
import { initialsFromName } from '../utils';
import type { Conversation } from '../types';
import styles from './ConversationInfoPanel.module.css';

interface ConversationInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ConversationInfoPanel({ conversation, onClose }: ConversationInfoPanelProps) {
  const { t } = useTranslation('messaging');
  const { user } = useAuth();
  const [addingMember, setAddingMember] = useState(false);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState<{ id: number; name: string } | null>(null);
  const { data: people, isLoading } = useDirectory(search);
  const addParticipant = useAddParticipant();
  const removeParticipant = useRemoveParticipant();

  const requesterParticipant = conversation.participants.find((participant) => participant.userId === user?.id);
  const isOwner = requesterParticipant?.role === 'owner';
  const memberIds = new Set(conversation.participants.map((participant) => participant.userId));
  const candidates = (people ?? []).filter(
    (person) => person.roleName === 'Instructor' && !memberIds.has(person.id),
  );

  const handleAdd = (userId: number) => {
    addParticipant.mutate(
      { conversationId: conversation.id, userId },
      { onSuccess: () => setAddingMember(false) },
    );
  };

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    removeParticipant.mutate(
      { conversationId: conversation.id, userId: removeTarget.id },
      { onSuccess: () => setRemoveTarget(null) },
    );
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={conversation.name || t('ConversationInfoPanel.title')}
      size="sm"
    >
      {!addingMember && (
        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {t('ConversationInfoPanel.membersCount', { count: conversation.participants.length })}
            </span>
            {isOwner && (
              <button type="button" className={styles.addButton} onClick={() => setAddingMember(true)}>
                <UserPlus size={16} />
                {t('ConversationInfoPanel.addMember')}
              </button>
            )}
          </div>
          <ul className={styles.memberList}>
            {conversation.participants.map((participant) => {
              const fullName = `${participant.firstname ?? ''} ${participant.lastname ?? ''}`.trim();
              return (
                <li key={participant.userId} className={styles.memberRow}>
                  <span className={styles.avatar}>{initialsFromName(fullName)}</span>
                  <span className={styles.memberDetails}>
                    <span className={styles.memberName}>{fullName}</span>
                    <span className={styles.memberEmail}>{participant.email}</span>
                  </span>
                  {participant.role === 'owner' && (
                    <span className={styles.ownerBadge} title={t('ConversationInfoPanel.owner')}>
                      <Crown size={14} />
                    </span>
                  )}
                  {isOwner && participant.userId !== user?.id && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => setRemoveTarget({ id: participant.userId, name: fullName })}
                      aria-label={t('ConversationInfoPanel.removeMember')}
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {addingMember && (
        <div className={styles.panel}>
          <div className={styles.addMemberHeader}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setAddingMember(false)}
              aria-label={t('ConversationInfoPanel.backToMembers')}
            >
              <ArrowLeft size={18} />
            </button>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={t('PeopleDirectory.searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>
          {isLoading && <p className={styles.statusText}>{t('PeopleDirectory.loading')}</p>}
          {!isLoading && candidates.length === 0 && (
            <p className={styles.statusText}>{t('PeopleDirectory.emptyState')}</p>
          )}
          <ul className={styles.memberList}>
            {candidates.map((person) => {
              const fullName = `${person.firstname} ${person.lastname}`;
              return (
                <li key={person.id}>
                  <button
                    type="button"
                    className={styles.memberRowButton}
                    disabled={addParticipant.isPending}
                    onClick={() => handleAdd(person.id)}
                  >
                    <span className={styles.avatar}>{initialsFromName(fullName)}</span>
                    <span className={styles.memberDetails}>
                      <span className={styles.memberName}>{fullName}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {removeTarget && (
        <ConfirmDialog
          isOpen
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemoveConfirm}
          title={t('ConversationInfoPanel.removeMemberConfirmTitle')}
          description={t('ConversationInfoPanel.removeMemberConfirmDescription', { name: removeTarget.name })}
          confirmLabel={t('ConversationInfoPanel.removeMember')}
          tone="danger"
          isLoading={removeParticipant.isPending}
        />
      )}
    </Modal>
  );
}
