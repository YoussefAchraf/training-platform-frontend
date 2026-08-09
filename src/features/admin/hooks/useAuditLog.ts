import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { adminApi } from '../api/adminApi';
import type { AuditLogFilters } from '../api/adminApi';

export function useAuditLog(filters: AuditLogFilters) {
  return useQuery({
    queryKey: queryKeys.admin.auditLog(filters.entityType, filters.entityId),
    queryFn: () => adminApi.auditLog(filters),
  });
}
