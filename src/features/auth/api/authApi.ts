import { apiClient } from '@/shared/lib/apiClient';
import type { Role, RoleCatalogEntry, User } from '@/shared/types/domain';

export interface SignupPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: Role;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface MeResponse {
  
  
  
  user: User | null;
}

export interface UpdateOwnProfilePayload {
  firstname?: string;
  lastname?: string;
  
  
  hasSeenTour?: boolean;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiClient.post<SignupResponse>('/auth/signup', payload).then((res) => res.data),

  
  
  
  
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload).then((res) => res.data),

  adminLogin: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/admin-login', payload).then((res) => res.data),

  me: () => apiClient.get<MeResponse>('/auth/me').then((res) => res.data),

  
  listRoles: () => apiClient.get<RoleCatalogEntry[]>('/auth/roles').then((res) => res.data),

  refresh: () => apiClient.post<{ message: string }>('/auth/refresh').then((res) => res.data),

  logout: () => apiClient.post<{ message: string }>('/auth/logout').then((res) => res.data),

  listPendingUsers: () => apiClient.get<User[]>('/auth/users/pending').then((res) => res.data),

  approveUser: (id: number) => apiClient.post<User>(`/auth/users/${id}/approve`).then((res) => res.data),

  rejectUser: (id: number) => apiClient.post<User>(`/auth/users/${id}/reject`).then((res) => res.data),

  updateMe: (payload: UpdateOwnProfilePayload) =>
    apiClient.patch<User>('/auth/me', payload).then((res) => res.data),

  // Short-lived bearer token for the one cross-origin caller (the chatbot's
  // n8n webhook) that can't receive this origin's httpOnly session cookie.
  // Meant to be used immediately and held only in memory - see chatbotClient.
  serviceToken: () => apiClient.get<{ accessToken: string }>('/auth/service-token').then((res) => res.data),
};
