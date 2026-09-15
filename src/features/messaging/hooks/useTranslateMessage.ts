import { useMutation } from '@tanstack/react-query';
import { messagingApi } from '../api/messagingApi';
import { useMessagingUiStore } from '../messagingUiStore';

export function useTranslateMessage() {
  const setTranslation = useMessagingUiStore((state) => state.setTranslation);

  return useMutation({
    mutationFn: ({ messageId, targetLanguage }: { messageId: number; targetLanguage: string }) =>
      messagingApi.translateMessage(messageId, targetLanguage),
    onSuccess: (data, variables) => {
      setTranslation(variables.messageId, data.translatedText);
    },
  });
}
