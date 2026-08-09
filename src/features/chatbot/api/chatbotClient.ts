import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { redirectToLoginAfterRefreshFailure } from '@/shared/lib/apiClient';

export interface ChatbotReply {
  reply: string;
  cached: boolean;
}

export const CHATBOT_WEBHOOK_URL = import.meta.env.VITE_CHATBOT_WEBHOOK_URL;

export const chatbotClient = axios.create({
  baseURL: CHATBOT_WEBHOOK_URL,
  headers: { 'Content-Type': 'application/json' },
});







let cachedServiceToken: string | null = null;
let serviceTokenPromise: Promise<string> | null = null;

async function fetchServiceToken(): Promise<string> {
  const { accessToken } = await authApi.serviceToken();
  cachedServiceToken = accessToken;
  return accessToken;
}

function getServiceTokenOnce(): Promise<string> {
  serviceTokenPromise ??= fetchServiceToken().finally(() => {
    serviceTokenPromise = null;
  });
  return serviceTokenPromise;
}

chatbotClient.interceptors.request.use(async (config) => {
  const token = cachedServiceToken ?? (await getServiceTokenOnce());
  config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

chatbotClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    const isRefreshable = originalRequest && status === 401 && !originalRequest._retry;
    if (!isRefreshable) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    cachedServiceToken = null;

    try {
      const token = await getServiceTokenOnce();
      originalRequest.headers.set('Authorization', `Bearer ${token}`);
      return chatbotClient(originalRequest);
    } catch (refreshError) {
      // The service token fetch itself failed, almost certainly because the
      // underlying session cookie is gone/expired - same recovery path as a
      // failed main-session refresh.
      redirectToLoginAfterRefreshFailure();
      return Promise.reject(refreshError);
    }
  },
);
