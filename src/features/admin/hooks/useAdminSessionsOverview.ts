import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { adminApi } from '../api/adminApi';

export function useAdminSessionsOverview(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.admin.sessions(),
    queryFn: adminApi.sessionsOverview,
    enabled: options?.enabled,
  });
}
