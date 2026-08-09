import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { calendarApi } from '../api/calendarApi';
import type { UpdateCalendarEventPayload } from '../api/calendarApi';

export function useGlobalCalendar(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.calendar.global(),
    queryFn: calendarApi.listGlobal,
    enabled: options?.enabled,
  });
}

export function useMyCalendar(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.calendar.mine(),
    queryFn: calendarApi.listMine,
    enabled: options?.enabled,
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCalendarEventPayload }) =>
      calendarApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendar.global() }),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => calendarApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendar.global() }),
  });
}
