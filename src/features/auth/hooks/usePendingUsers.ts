import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { authApi } from '../api/authApi';

export function usePendingUsers() {
  return useQuery({
    queryKey: queryKeys.auth.pendingUsers(),
    queryFn: authApi.listPendingUsers,
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => authApi.approveUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.pendingUsers() }),
  });
}

export function useRejectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => authApi.rejectUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.pendingUsers() }),
  });
}
