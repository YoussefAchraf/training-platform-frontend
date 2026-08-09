import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { reportsApi } from '../api/reportsApi';

export function useReport(sessionId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reports.detail(sessionId),
    queryFn: () => reportsApi.get(sessionId),
    enabled: options?.enabled,
    retry: false,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => reportsApi.generate(sessionId),
    onSuccess: (data, sessionId) => {
      queryClient.setQueryData(queryKeys.reports.detail(sessionId), data);
    },
  });
}

export function useDownloadReportPdf() {
  return useMutation({
    mutationFn: (sessionId: number) => reportsApi.downloadPdf(sessionId),
  });
}
