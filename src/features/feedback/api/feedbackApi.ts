import { apiClient } from '@/shared/lib/apiClient';
import type { FeedbackCategory, FeedbackReport } from '@/shared/types/domain';

export interface SubmitFeedbackPayload {
  category: FeedbackCategory;
  message: string;
}

export const feedbackApi = {
  submit: (payload: SubmitFeedbackPayload) =>
    apiClient.post<FeedbackReport>('/feedback', payload).then((res) => res.data),

  list: () => apiClient.get<FeedbackReport[]>('/feedback').then((res) => res.data),
};
