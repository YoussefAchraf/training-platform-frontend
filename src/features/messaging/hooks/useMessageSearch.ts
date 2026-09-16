import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';

export function useMessageSearch(conversationId: number | null, term: string) {
  const debouncedTerm = useDebounce(term, 300);
  const trimmed = debouncedTerm.trim();

  return useQuery({
    queryKey: queryKeys.messaging.messageSearch(conversationId ?? -1, trimmed),
    queryFn: () => messagingApi.listMessages(conversationId!, { search: trimmed, limit: 50 }),
    enabled: conversationId != null && trimmed.length > 0,
    staleTime: 10_000,
  });
}
