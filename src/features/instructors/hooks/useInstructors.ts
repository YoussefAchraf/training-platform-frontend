import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { instructorsApi } from '../api/instructorsApi';
import type { UpdateInstructorPayload } from '../api/instructorsApi';

export function useInstructors(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.instructors.list(),
    queryFn: instructorsApi.list,
    enabled: options?.enabled,
  });
}

export function useMyInstructorProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.instructors.me(),
    queryFn: instructorsApi.me,
    enabled: options?.enabled,
  });
}

export function useUpdateMyInstructorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: instructorsApi.updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.instructors.me(), data);
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateInstructorPayload }) =>
      instructorsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.instructors.list() }),
  });
}
