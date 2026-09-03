import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { feedbackApi } from '../api/feedbackApi';

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: feedbackApi.submit,
  });
}


export function useFeedbackReports() {
  return useQuery({
    queryKey: queryKeys.feedback.list(),
    queryFn: feedbackApi.list,
  });
}
