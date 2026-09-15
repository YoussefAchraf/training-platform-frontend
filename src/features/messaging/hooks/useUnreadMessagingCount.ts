import { useConversations } from './useConversations';

export function useUnreadMessagingCount(): number {
  const { data } = useConversations();
  if (!data) return 0;
  return data.reduce((total, conversation) => total + conversation.unreadCount, 0);
}
