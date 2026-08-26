import { apiClient } from '@/shared/lib/apiClient';
import type { Training, TrainingDurationUnit } from '@/shared/types/domain';

export interface CreateTrainingPayload {
  name: string;
  providerId: number;
  description?: string;
  duration?: number;
  durationUnit?: TrainingDurationUnit;
}

export interface UpdateTrainingPayload {
  name: string;
  description?: string;
  duration?: number;
  durationUnit?: TrainingDurationUnit;
}

export const trainingsApi = {
  list: (providerId?: number) =>
    apiClient
      .get<Training[]>('/trainings', { params: providerId ? { providerId } : undefined })
      .then((res) => res.data),
  create: (payload: CreateTrainingPayload) =>
    apiClient.post<Training>('/trainings', payload).then((res) => res.data),
  update: (id: number, payload: UpdateTrainingPayload) =>
    apiClient.patch<Training>(`/trainings/${id}`, payload).then((res) => res.data),
  remove: (id: number) => apiClient.delete<void>(`/trainings/${id}`).then(() => undefined),
};
