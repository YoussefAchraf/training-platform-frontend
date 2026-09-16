import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';

export function useConversationMedia(conversationId: number | null, filter: 'media' | 'files' | 'links' | null) {
  return useQuery({
    queryKey: queryKeys.messaging.media(conversationId ?? -1, filter ?? 'media'),
    queryFn: () => messagingApi.listConversationMedia(conversationId!, filter!, { limit: 100 }),
    enabled: conversationId != null && filter != null,
    staleTime: 10_000,
  });
}
