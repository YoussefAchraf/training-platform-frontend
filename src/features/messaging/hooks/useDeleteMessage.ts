import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import type { Message } from '../types';

interface DeleteMessageVariables {
  messageId: number;
  conversationId: number;
  scope: 'me' | 'everyone';
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ messageId, scope }: DeleteMessageVariables) => messagingApi.deleteMessage(messageId, scope),
    onSuccess: (result: Partial<Message> & { scope?: string }, variables) => {
      queryClient.setQueryData<Message[]>(queryKeys.messaging.messages(variables.conversationId), (existing) => {
        if (!existing) return existing;
        if (variables.scope === 'me') {
          return existing.filter((item) => item.id !== variables.messageId);
        }
        return existing.map((item) => (item.id === variables.messageId ? { ...item, ...result } : item));
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
