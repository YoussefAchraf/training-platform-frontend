import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';
import type { Conversation } from '../types';

export function useCreateDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) => messagingApi.createDirectConversation(targetUserId),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) => {
        if (!existing) return existing;
        const withoutDuplicate = existing.filter((item) => item.id !== conversation.id);
        return [conversation, ...withoutDuplicate];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    },
  });
}
