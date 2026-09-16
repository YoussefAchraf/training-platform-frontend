import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import { useMessagingUiStore } from '../messagingUiStore';
import type { Conversation } from '../types';

export function useHideConversation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const selectedConversationId = useMessagingUiStore((state) => state.selectedConversationId);
  const selectConversation = useMessagingUiStore((state) => state.selectConversation);

  return useMutation({
    mutationFn: (conversationId: number) => messagingApi.hideConversation(conversationId),
    onSuccess: (_result, conversationId) => {
      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) =>
        existing?.filter((conversation) => conversation.id !== conversationId),
      );
      if (selectedConversationId === conversationId) {
        selectConversation(null);
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
