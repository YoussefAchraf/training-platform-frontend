import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Crown, File as FileIcon, Link2, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Modal } from '@/shared/components/Modal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/utils/cn';
import { useDirectory } from '../hooks/useDirectory';
import { useAddParticipant } from '../hooks/useAddParticipant';
import { useRemoveParticipant } from '../hooks/useRemoveParticipant';
import { useConversationMedia } from '../hooks/useConversationMedia';
import { messagingApi } from '../api/messagingApi';
import { conversationDisplayName, initialsFromName } from '../utils';
import type { Conversation, Message } from '../types';
import panelStyles from './ConversationInfoPanel.module.css';
import paneStyles from './ConversationsPane.module.css';

interface ConversationInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

type InfoTab = 'members' | 'media' | 'files' | 'links';

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function firstUrl(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0].replace(/[.,;:!?)]+$/, '') : null;
}

function MediaThumb({ messageId }: { messageId: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={panelStyles.mediaThumbFallback}>
        <FileIcon size={24} />
      </span>
    );
  }
  return (
    <img
      src={messagingApi.attachmentUrl(messageId)}
      alt=""
      className={panelStyles.mediaThumb}
      onError={() => setFailed(true)}
    />
  );
}

export function ConversationInfoPanel({ conversation, onClose }: ConversationInfoPanelProps) {
  const { t } = useTranslation('messaging');
  const { user } = useAuth();
  const isGroup = conversation.type === 'group';
  const [activeTab, setActiveTab] = useState<InfoTab>(isGroup ? 'members' : 'media');
  const [addingMember, setAddingMember] = useState(false);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState<{ id: number; name: string } | null>(null);
  const { data: people, isLoading } = useDirectory(search);
  const addParticipant = useAddParticipant();
  const removeParticipant = useRemoveParticipant();
  const { data: mediaMessages, isLoading: mediaLoading } = useConversationMedia(
    conversation.id,
    activeTab === 'members' ? null : activeTab,
  );

  const requesterParticipant = conversation.participants.find((participant) => participant.userId === user?.id);
  const isOwner = requesterParticipant?.role === 'owner';
  const memberIds = new Set(conversation.participants.map((participant) => participant.userId));
  const candidates = (people ?? []).filter(
    (person) => person.roleName === 'Instructor' && !memberIds.has(person.id),
  );

  const title = isGroup ? conversation.name || t('ConversationInfoPanel.title') : conversationDisplayName(conversation, user?.id);

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

  const renderMediaGrid = (messages: Message[]) => (
    <div className={panelStyles.mediaGrid}>
      {messages.map((message) => (
        <a
          key={message.id}
          href={messagingApi.attachmentUrl(message.id)}
          target="_blank"
          rel="noreferrer"
          className={panelStyles.mediaThumbLink}
        >
          <MediaThumb messageId={message.id} />
        </a>
      ))}
    </div>
  );

  const renderFilesList = (messages: Message[]) => (
    <ul className={panelStyles.memberList}>
      {messages.map((message) => (
        <li key={message.id}>
          <a
            href={messagingApi.attachmentUrl(message.id)}
            target="_blank"
            rel="noreferrer"
            className={panelStyles.memberRowButton}
          >
            <FileIcon size={20} />
            <span className={panelStyles.memberDetails}>
              <span className={panelStyles.memberName}>{message.attachmentOriginalName ?? t('MessageBubble.fileLabel')}</span>
              {message.attachmentSizeBytes != null && (
                <span className={panelStyles.memberEmail}>{formatSize(message.attachmentSizeBytes)}</span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );

  const renderLinksList = (messages: Message[]) => (
    <ul className={panelStyles.memberList}>
      {messages.map((message) => {
        const url = firstUrl(message.body);
        if (!url) return null;
        return (
          <li key={message.id}>
            <a href={url} target="_blank" rel="noreferrer" className={panelStyles.memberRowButton}>
              <Link2 size={20} />
              <span className={panelStyles.memberDetails}>
                <span className={panelStyles.memberName}>{url}</span>
                <span className={panelStyles.memberEmail}>{message.body}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <Modal isOpen onClose={onClose} title={title} size="sm">
      <div className={panelStyles.panel}>
        <div className={paneStyles.tabs}>
          {isGroup && (
            <button
              type="button"
              className={cn(paneStyles.tab, activeTab === 'members' && paneStyles.tabActive)}
              onClick={() => setActiveTab('members')}
            >
              {t('ConversationInfoPanel.tabMembers')}
            </button>
          )}
          <button
            type="button"
            className={cn(paneStyles.tab, activeTab === 'media' && paneStyles.tabActive)}
            onClick={() => setActiveTab('media')}
          >
            {t('ConversationInfoPanel.tabMedia')}
          </button>
          <button
            type="button"
            className={cn(paneStyles.tab, activeTab === 'files' && paneStyles.tabActive)}
            onClick={() => setActiveTab('files')}
          >
            {t('ConversationInfoPanel.tabFiles')}
          </button>
          <button
            type="button"
            className={cn(paneStyles.tab, activeTab === 'links' && paneStyles.tabActive)}
            onClick={() => setActiveTab('links')}
          >
            {t('ConversationInfoPanel.tabLinks')}
          </button>
        </div>

        {activeTab === 'members' && !addingMember && (
          <>
            <div className={panelStyles.sectionHeader}>
              <span className={panelStyles.sectionTitle}>
                {t('ConversationInfoPanel.membersCount', { count: conversation.participants.length })}
              </span>
              {isOwner && (
                <button type="button" className={panelStyles.addButton} onClick={() => setAddingMember(true)}>
                  <UserPlus size={16} />
                  {t('ConversationInfoPanel.addMember')}
                </button>
              )}
            </div>
            <ul className={panelStyles.memberList}>
              {conversation.participants.map((participant) => {
                const fullName = `${participant.firstname ?? ''} ${participant.lastname ?? ''}`.trim();
                return (
                  <li key={participant.userId} className={panelStyles.memberRow}>
                    <span className={panelStyles.avatar}>{initialsFromName(fullName)}</span>
                    <span className={panelStyles.memberDetails}>
                      <span className={panelStyles.memberName}>{fullName}</span>
                      <span className={panelStyles.memberEmail}>{participant.email}</span>
                    </span>
                    {participant.role === 'owner' && (
                      <span className={panelStyles.ownerBadge} title={t('ConversationInfoPanel.owner')}>
                        <Crown size={14} />
                      </span>
                    )}
                    {isOwner && participant.userId !== user?.id && (
                      <button
                        type="button"
                        className={panelStyles.removeButton}
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
          </>
        )}

        {activeTab === 'members' && addingMember && (
          <>
            <div className={panelStyles.addMemberHeader}>
              <button
                type="button"
                className={panelStyles.backButton}
                onClick={() => setAddingMember(false)}
                aria-label={t('ConversationInfoPanel.backToMembers')}
              >
                <ArrowLeft size={18} />
              </button>
              <input
                type="search"
                className={panelStyles.searchInput}
                placeholder={t('PeopleDirectory.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
              />
            </div>
            {isLoading && <p className={panelStyles.statusText}>{t('PeopleDirectory.loading')}</p>}
            {!isLoading && candidates.length === 0 && (
              <p className={panelStyles.statusText}>{t('PeopleDirectory.emptyState')}</p>
            )}
            <ul className={panelStyles.memberList}>
              {candidates.map((person) => {
                const fullName = `${person.firstname} ${person.lastname}`;
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      className={panelStyles.memberRowButton}
                      disabled={addParticipant.isPending}
                      onClick={() => handleAdd(person.id)}
                    >
                      <span className={panelStyles.avatar}>{initialsFromName(fullName)}</span>
                      <span className={panelStyles.memberDetails}>
                        <span className={panelStyles.memberName}>{fullName}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {activeTab !== 'members' && mediaLoading && <p className={panelStyles.statusText}>{t('PeopleDirectory.loading')}</p>}
        {activeTab !== 'members' && !mediaLoading && (!mediaMessages || mediaMessages.length === 0) && (
          <p className={panelStyles.statusText}>{t('ConversationInfoPanel.emptyMedia')}</p>
        )}
        {activeTab === 'media' && mediaMessages && mediaMessages.length > 0 && renderMediaGrid(mediaMessages)}
        {activeTab === 'files' && mediaMessages && mediaMessages.length > 0 && renderFilesList(mediaMessages)}
        {activeTab === 'links' && mediaMessages && mediaMessages.length > 0 && renderLinksList(mediaMessages)}
      </div>

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
