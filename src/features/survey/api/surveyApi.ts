import { apiClient } from '@/shared/lib/apiClient';
import type { Survey, SurveyInfo, SurveyQR } from '@/shared/types/domain';

export interface SubmitSurveyPayload {
  attendeeId?: number | null;
  instructorScore: number;
  npsScore: number;
  comments?: string;
}

export const surveyApi = {
  getQrCode: (sessionId: number) =>
    apiClient.get<SurveyQR>(`/survey/${sessionId}/qr-code`).then((res) => res.data),

  getForm: (sessionId: number) =>
    apiClient.get<SurveyInfo>(`/survey/${sessionId}/form`).then((res) => res.data),

  submit: (sessionId: number, payload: SubmitSurveyPayload) =>
    apiClient.post<Survey>(`/survey/${sessionId}/submit`, payload).then((res) => res.data),
};
