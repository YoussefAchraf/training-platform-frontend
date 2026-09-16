import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';

export function useCanUseMessaging(): boolean {
  const { isManager, isInstructor } = useAuth();
  return isManager || isInstructor;
}

export function useConversations() {
  const canUseMessaging = useCanUseMessaging();

  return useQuery({
    queryKey: queryKeys.messaging.conversations(),
    queryFn: () => messagingApi.listConversations(),
    enabled: canUseMessaging,
    staleTime: 15_000,
  });
}
