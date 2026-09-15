import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';
import type { Message } from '../types';

export interface OptimisticMessage extends Message {
  clientId: string;
  pending?: boolean;
  failed?: boolean;
  localPreviewUrl?: string;
}

interface SendMessageVariables {
  body: string;
  replyToMessageId?: number;
  clientId: string;
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ body, replyToMessageId }: SendMessageVariables) =>
      messagingApi.sendTextMessage(conversationId, body, replyToMessageId),
    onMutate: ({ body, replyToMessageId, clientId }: SendMessageVariables) => {
      const optimisticMessage: OptimisticMessage = {
        id: -Date.now(),
        clientId,
        conversationId,
        senderId: user?.id ?? null,
        senderName: user ? `${user.firstname} ${user.lastname}` : null,
        type: 'text',
        body,
        attachmentKey: null,
        attachmentOriginalName: null,
        attachmentMime: null,
        attachmentSizeBytes: null,
        attachmentDurationSeconds: null,
        replyToMessageId: replyToMessageId ?? null,
        createdAt: new Date().toISOString(),
        editedAt: null,
        pending: true,
      };
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) => [
        ...(existing ?? []),
        optimisticMessage,
      ]);
      return { clientId };
    },
    onSuccess: (message, _variables, context) => {
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
        (existing ?? [])
          .filter((item) => item.clientId !== context?.clientId && item.id !== message.id)
          .concat({ ...message, clientId: context?.clientId ?? '' })
          .sort((a, b) => a.id - b.id),
      );
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
        existing?.map((item) =>
          item.clientId === context?.clientId ? { ...item, pending: false, failed: true } : item,
        ),
      );
    },
  });
}
