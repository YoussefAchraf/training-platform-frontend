import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import type { Conversation } from '../types';

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ name, memberUserIds }: { name: string; memberUserIds: number[] }) =>
      messagingApi.createGroupConversation(name, memberUserIds),
    onSuccess: (conversation: Conversation) => {
      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) => {
        if (!existing) return [conversation];
        return [conversation, ...existing.filter((item) => item.id !== conversation.id)];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
