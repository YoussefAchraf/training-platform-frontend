import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';

export function useAddParticipant() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: number; userId: number }) =>
      messagingApi.addParticipant(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
