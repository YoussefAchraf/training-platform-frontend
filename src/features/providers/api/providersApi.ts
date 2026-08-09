import { apiClient } from '@/shared/lib/apiClient';
import type { Provider } from '@/shared/types/domain';

export interface CreateProviderPayload {
  name: string;
  description?: string;
  logoUrl?: string;
}

export type UpdateProviderPayload = CreateProviderPayload;

export const providersApi = {
  list: () => apiClient.get<Provider[]>('/providers').then((res) => res.data),
  create: (payload: CreateProviderPayload) =>
    apiClient.post<Provider>('/providers', payload).then((res) => res.data),
  update: (id: number, payload: UpdateProviderPayload) =>
    apiClient.patch<Provider>(`/providers/${id}`, payload).then((res) => res.data),
  remove: (id: number) => apiClient.delete<void>(`/providers/${id}`).then(() => undefined),
};
