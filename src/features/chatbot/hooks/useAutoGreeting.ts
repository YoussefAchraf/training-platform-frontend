import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CHATBOT_WEBHOOK_URL } from '../api/chatbotClient';
import { useChatStore } from '../chatStore';


export function useAutoGreeting() {
  const { t } = useTranslation('chatbot');
  const { user } = useAuth();

  useEffect(() => {
    if (!CHATBOT_WEBHOOK_URL || !user) return;
    if (useChatStore.getState().messages.length > 0) return;
    useChatStore.getState().addMessage({
      role: 'assistant',
      content: t('ChatWidget.autoGreeting', { name: user.firstname }),
    });
    
    
    
    
  }, [user?.id]);
}
