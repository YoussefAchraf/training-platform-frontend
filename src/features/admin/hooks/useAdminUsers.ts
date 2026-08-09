import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { adminApi } from '../api/adminApi';
import type { UpdateUserByAdminPayload } from '../api/adminApi';

export function useAdminUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: adminApi.listUsers,
    enabled: options?.enabled,
  });
}

export function useUpdateUserByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserByAdminPayload }) =>
      adminApi.updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  });
}
