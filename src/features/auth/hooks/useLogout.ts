import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/features/chatbot/chatStore';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../authStore';

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const clearChat = useChatStore((state) => state.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      clearChat();
      queryClient.clear();
    },
  });
}
