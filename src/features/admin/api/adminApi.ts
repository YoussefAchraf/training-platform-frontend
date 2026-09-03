import { apiClient } from '@/shared/lib/apiClient';
import type { AdminSessionOverview, AuditEntityType, AuditLogEntry, Role, User, UserStatus } from '@/shared/types/domain';

export interface UpdateUserByAdminPayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: Role;
  status?: UserStatus;
}

export interface AuditLogFilters {
  entityType?: AuditEntityType;
  entityId?: number;
  startDate?: string;
  endDate?: string;
  roleName?: Role;
}

export const adminApi = {
  listUsers: () => apiClient.get<User[]>('/admin/users').then((res) => res.data),

  updateUser: (id: number, payload: UpdateUserByAdminPayload) =>
    apiClient.patch<User>(`/admin/users/${id}`, payload).then((res) => res.data),

  deactivateUser: (id: number) => apiClient.delete<User>(`/admin/users/${id}`).then((res) => res.data),

  hardDeleteUser: (id: number) =>
    apiClient.delete<{ id: number; deleted: boolean }>(`/admin/users/${id}/purge`).then((res) => res.data),

  sendPasswordReset: (id: number) =>
    apiClient.post<{ message: string }>(`/admin/users/${id}/send-password-reset`).then((res) => res.data),

  sessionsOverview: () =>
    apiClient.get<AdminSessionOverview[]>('/admin/sessions').then((res) => res.data),

  auditLog: (filters: AuditLogFilters) =>
    apiClient
      .get<AuditLogEntry[]>('/admin/audit-log', {
        params: {
          entityType: filters.entityType,
          entityId: filters.entityId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          roleName: filters.roleName,
        },
      })
      .then((res) => res.data),
};
