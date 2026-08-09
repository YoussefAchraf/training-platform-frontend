import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { surveyApi } from '../api/surveyApi';
import type { SubmitSurveyPayload } from '../api/surveyApi';

export function useSurveyForm(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.survey.form(sessionId),
    queryFn: () => surveyApi.getForm(sessionId),
    retry: false,
  });
}

export function useSubmitSurvey(sessionId: number) {
  return useMutation({
    mutationFn: (payload: SubmitSurveyPayload) => surveyApi.submit(sessionId, payload),
  });
}

export function useSurveyQrCode(sessionId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.survey.qrCode(sessionId),
    queryFn: () => surveyApi.getQrCode(sessionId),
    enabled: options?.enabled,
  });
}
