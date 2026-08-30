import { apiClient } from '@/shared/lib/apiClient';
import type { BulkImportResult, SessionAttendee, TrainingSession } from '@/shared/types/domain';

export interface CreateSessionPayload {
  trainingId: number;
  clientId: number;
  startDate: string;
  endDate: string;
  includeWeekends?: boolean;
}

export interface AddAttendeePayload {
  name: string;
  email?: string;
}

export interface UpdateAttendeePayload {
  name: string;
  email?: string;
}

export interface UpdateSessionPayload {
  startDate: string;
  endDate: string;
  includeWeekends?: boolean;
}

export const sessionsApi = {
  list: () => apiClient.get<TrainingSession[]>('/sessions').then((res) => res.data),

  create: (payload: CreateSessionPayload) =>
    apiClient.post<TrainingSession>('/sessions', payload).then((res) => res.data),

  update: (id: number, payload: UpdateSessionPayload) =>
    apiClient.patch<TrainingSession>(`/sessions/${id}`, payload).then((res) => res.data),

  cancel: (id: number) => apiClient.post<TrainingSession>(`/sessions/${id}/cancel`).then((res) => res.data),

  assignInstructor: (id: number, instructorId: number) =>
    apiClient
      .post<TrainingSession>(`/sessions/${id}/assign-instructor`, { instructorId })
      .then((res) => res.data),

  addAttendee: (id: number, payload: AddAttendeePayload) =>
    apiClient.post<SessionAttendee>(`/sessions/${id}/attendees`, payload).then((res) => res.data),

  listAttendees: (id: number) =>
    apiClient.get<SessionAttendee[]>(`/sessions/${id}/attendees`).then((res) => res.data),

  importAttendees: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<BulkImportResult>(`/sessions/${id}/attendees/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  markAttendance: (sessionId: number, attendeeId: number, status: 'present' | 'absent') =>
    apiClient
      .patch<SessionAttendee>(`/sessions/${sessionId}/attendees/${attendeeId}/attendance`, { status })
      .then((res) => res.data),

  updateAttendee: (sessionId: number, attendeeId: number, payload: UpdateAttendeePayload) =>
    apiClient
      .patch<SessionAttendee>(`/sessions/${sessionId}/attendees/${attendeeId}`, payload)
      .then((res) => res.data),

  deleteAttendee: (sessionId: number, attendeeId: number) =>
    apiClient.delete<void>(`/sessions/${sessionId}/attendees/${attendeeId}`).then(() => undefined),
};
