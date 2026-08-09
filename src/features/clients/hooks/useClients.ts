import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { clientsApi } from '../api/clientsApi';
import type { UpdateClientPayload } from '../api/clientsApi';

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients.list(),
    queryFn: clientsApi.list,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients.list() }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClientPayload }) => clientsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients.list() }),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients.list() }),
  });
}
