import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: queryKeys.messaging.messages(conversationId ?? -1),
    queryFn: () => messagingApi.listMessages(conversationId!),
    enabled: conversationId != null,
    staleTime: 10_000,
  });
}
