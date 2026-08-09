import { apiClient } from '@/shared/lib/apiClient';
import type { SessionAttendee, TrainingSession } from '@/shared/types/domain';

export interface CreateSessionPayload {
  trainingId: number;
  clientId: number;
  startDate: string;
  endDate: string;
}

export interface AddAttendeePayload {
  name: string;
  email?: string;
}

export interface UpdateSessionPayload {
  startDate: string;
  endDate: string;
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

  respond: (id: number, decision: 'accept' | 'refuse') =>
    apiClient.post<TrainingSession>(`/sessions/${id}/respond`, { decision }).then((res) => res.data),

  addAttendee: (id: number, payload: AddAttendeePayload) =>
    apiClient.post<SessionAttendee>(`/sessions/${id}/attendees`, payload).then((res) => res.data),

  listAttendees: (id: number) =>
    apiClient.get<SessionAttendee[]>(`/sessions/${id}/attendees`).then((res) => res.data),
};
