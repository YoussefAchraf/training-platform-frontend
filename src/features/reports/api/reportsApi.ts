import { apiClient } from '@/shared/lib/apiClient';
import type { Report } from '@/shared/types/domain';

export const reportsApi = {
  
  
  get: (sessionId: number) => apiClient.get<Report | null>(`/reports/${sessionId}`).then((res) => res.data),
  generate: (sessionId: number) =>
    apiClient.post<Report>(`/reports/${sessionId}/generate`).then((res) => res.data),
  downloadPdf: (sessionId: number) =>
    apiClient.get<Blob>(`/reports/${sessionId}/pdf`, { responseType: 'blob' }).then((res) => res.data),
};
