import { apiClient } from '@/shared/lib/apiClient';
import type { Instructor } from '@/shared/types/domain';

export interface UpdateInstructorPayload {
  bio?: string;
  trainingIds?: number[];
}

export const instructorsApi = {
  list: () => apiClient.get<Instructor[]>('/instructors').then((res) => res.data),
  me: () => apiClient.get<Instructor>('/instructors/me').then((res) => res.data),
  updateMe: (payload: UpdateInstructorPayload) =>
    apiClient.patch<Instructor>('/instructors/me', payload).then((res) => res.data),
  update: (id: number, payload: UpdateInstructorPayload) =>
    apiClient.patch<Instructor>(`/instructors/${id}`, payload).then((res) => res.data),
};
