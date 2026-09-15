import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { messagingApi } from '../api/messagingApi';
import { useMessagingUiStore } from '../messagingUiStore';

export function useTranslateMessage() {
  const setTranslation = useMessagingUiStore((state) => state.setTranslation);
  const toast = useToast();

  return useMutation({
    mutationFn: ({ messageId, targetLanguage }: { messageId: number; targetLanguage: string }) =>
      messagingApi.translateMessage(messageId, targetLanguage),
    onSuccess: (data, variables) => {
      setTranslation(variables.messageId, data.translatedText);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
