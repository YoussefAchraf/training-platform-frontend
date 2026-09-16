import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import type { Message } from '../types';

export function useForwardMessage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ messageId, targetConversationId }: { messageId: number; targetConversationId: number }) =>
      messagingApi.forwardMessage(messageId, targetConversationId),
    onSuccess: (message: Message) => {
      queryClient.setQueryData<Message[]>(queryKeys.messaging.messages(message.conversationId), (existing) => {
        if (!existing) return existing;
        return [...existing.filter((item) => item.id !== message.id), message].sort((a, b) => a.id - b.id);
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
