import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import type { Conversation } from '../types';

export function useSetConversationMuted() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ conversationId, muted }: { conversationId: number; muted: boolean }) =>
      messagingApi.setConversationMuted(conversationId, muted),
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) =>
        existing?.map((conversation) =>
          conversation.id === variables.conversationId
            ? {
                ...conversation,
                participants: conversation.participants.map((participant) =>
                  participant.userId === user?.id
                    ? { ...participant, mutedAt: variables.muted ? new Date().toISOString() : null }
                    : participant,
                ),
              }
            : conversation,
        ),
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
