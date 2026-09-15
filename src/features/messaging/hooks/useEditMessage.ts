import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import type { Message } from '../types';

export function useEditMessage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: number; body: string }) =>
      messagingApi.editMessage(messageId, body),
    onSuccess: (message: Message) => {
      queryClient.setQueryData<Message[]>(queryKeys.messaging.messages(message.conversationId), (existing) =>
        existing?.map((item) => (item.id === message.id ? message : item)),
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
