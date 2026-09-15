import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';
import { useCanUseMessaging } from './useConversations';

export function useDirectory(search: string) {
  const canUseMessaging = useCanUseMessaging();

  return useQuery({
    queryKey: queryKeys.messaging.directory(search),
    queryFn: () => messagingApi.listDirectory(search || undefined),
    enabled: canUseMessaging,
    staleTime: 30_000,
  });
}
