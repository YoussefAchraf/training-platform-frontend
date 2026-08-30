import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { sessionsApi } from '../api/sessionsApi';
import type { AddAttendeePayload, UpdateAttendeePayload, UpdateSessionPayload } from '../api/sessionsApi';

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: sessionsApi.list,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSessionPayload }) =>
      sessionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

export function useAssignInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, instructorId }: { id: number; instructorId: number }) =>
      sessionsApi.assignInstructor(id, instructorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() }),
  });
}

export function useAddAttendee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddAttendeePayload }) =>
      sessionsApi.addAttendee(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.attendees(id) });
    },
  });
}

export function useSessionAttendees(sessionId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.sessions.attendees(sessionId),
    queryFn: () => sessionsApi.listAttendees(sessionId),
    enabled: options.enabled ?? true,
  });
}

export function useImportAttendees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => sessionsApi.importAttendees(id, file),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.attendees(id) });
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, attendeeId, status }: { sessionId: number; attendeeId: number; status: 'present' | 'absent' }) =>
      sessionsApi.markAttendance(sessionId, attendeeId, status),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.attendees(sessionId) });
    },
  });
}

export function useUpdateAttendee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      attendeeId,
      payload,
    }: {
      sessionId: number;
      attendeeId: number;
      payload: UpdateAttendeePayload;
    }) => sessionsApi.updateAttendee(sessionId, attendeeId, payload),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.attendees(sessionId) });
    },
  });
}

export function useDeleteAttendee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, attendeeId }: { sessionId: number; attendeeId: number }) =>
      sessionsApi.deleteAttendee(sessionId, attendeeId),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.attendees(sessionId) });
    },
  });
}
