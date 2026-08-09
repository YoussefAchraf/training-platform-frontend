import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { trainingsApi } from '../api/trainingsApi';
import type { UpdateTrainingPayload } from '../api/trainingsApi';

export function useTrainings(providerId?: number) {
  return useQuery({
    queryKey: queryKeys.trainings.list(providerId),
    queryFn: () => trainingsApi.list(providerId),
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trainingsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all }),
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTrainingPayload }) =>
      trainingsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all }),
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => trainingsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.trainings.all }),
  });
}
