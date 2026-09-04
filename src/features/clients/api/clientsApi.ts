import { apiClient } from '@/shared/lib/apiClient';
import type { Client } from '@/shared/types/domain';

export interface CreateClientPayload {
  companyName: string;
  email?: string;
  phone?: string;
  country?: string;
}

export type UpdateClientPayload = CreateClientPayload;

export const clientsApi = {
  list: () => apiClient.get<Client[]>('/clients').then((res) => res.data),
  create: (payload: CreateClientPayload) =>
    apiClient.post<Client>('/clients', payload).then((res) => res.data),
  update: (id: number, payload: UpdateClientPayload) =>
    apiClient.patch<Client>(`/clients/${id}`, payload).then((res) => res.data),
  remove: (id: number) => apiClient.delete<void>(`/clients/${id}`).then(() => undefined),
};
