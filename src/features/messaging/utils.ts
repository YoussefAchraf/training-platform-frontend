import type { Conversation } from './types';

export function conversationDisplayName(conversation: Conversation, currentUserId: number | undefined): string {
  if (conversation.type === 'group') return conversation.name || '';
  const other = conversation.participants.find((participant) => participant.userId !== currentUserId);
  return other ? `${other.firstname ?? ''} ${other.lastname ?? ''}`.trim() : '';
}

export function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
