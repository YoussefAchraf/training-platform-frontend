import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/features/chatbot/chatStore';
import { paths } from '@/routes/paths';
import { setIntentionalLogoutInProgress } from '@/shared/lib/apiClient';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../authStore';

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const clearChat = useChatStore((state) => state.clear);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    
    
    
    
    
    mutationFn: (_redirectTo: string) => {
      
      
      
      
      setIntentionalLogoutInProgress(true);
      return authApi.logout();
    },
    onSettled: (_data, _error, redirectTo) => {
      navigate(redirectTo ?? paths.login, { replace: true });
      
      
      
      
      
      
      
      
      
      setTimeout(() => {
        clearSession();
        clearChat();
        queryClient.clear();
        
        
        setTimeout(() => setIntentionalLogoutInProgress(false), 2000);
      }, 0);
    },
  });
}
