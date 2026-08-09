import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { providersApi } from '../api/providersApi';
import type { UpdateProviderPayload } from '../api/providersApi';

export function useProviders() {
  return useQuery({
    queryKey: queryKeys.providers.list(),
    queryFn: providersApi.list,
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: providersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.providers.list() }),
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProviderPayload }) =>
      providersApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.providers.list() }),
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => providersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.providers.list() }),
  });
}
