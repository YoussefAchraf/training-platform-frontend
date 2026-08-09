import { apiClient } from '@/shared/lib/apiClient';

export interface SubscribePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export const pushApi = {
  subscribe: (payload: SubscribePayload) => apiClient.post('/push/subscribe', payload).then((res) => res.data),
  unsubscribe: (endpoint: string) =>
    apiClient.post('/push/unsubscribe', { endpoint }).then((res) => res.data),
};
