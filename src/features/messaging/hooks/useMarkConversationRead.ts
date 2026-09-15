import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';
import type { Conversation } from '../types';

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: number; messageId: number }) =>
      messagingApi.markRead(conversationId, messageId),
    onMutate: ({ conversationId }) => {
      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) =>
        existing?.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      );
    },
  });
}
