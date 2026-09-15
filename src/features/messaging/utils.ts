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
