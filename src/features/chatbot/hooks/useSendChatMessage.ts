import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { chatbotClient, type ChatbotReply } from '../api/chatbotClient';
import { useChatStore } from '../chatStore';

function errorReplyFor(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = (error.response?.data as { error?: string } | undefined)?.error;
    if (status === 403) {
      return serverMessage ?? "I can't help with that for your account role.";
    }
    if (status === 429) {
      return "I'm getting a lot of requests right now - please try again in a moment.";
    }
    if (status === 401) {
      return 'Your session expired. Please log in again to keep chatting.';
    }
  }
  return "Sorry, I couldn't reach the assistant. Please try again.";
}

export function useSendChatMessage() {
  const addMessage = useChatStore((state) => state.addMessage);
  const sessionId = useChatStore((state) => state.sessionId);

  return useMutation({
    mutationFn: (message: string) =>
      chatbotClient
        .post<ChatbotReply>('', { message, sessionId })
        .then((res) => res.data),
    onMutate: (message) => {
      addMessage({ role: 'user', content: message });
    },
    onSuccess: (data) => {
      const reply = typeof data?.reply === 'string' && data.reply.trim() ? data.reply : "Sorry, I didn't get a reply. Please try again.";
      addMessage({ role: 'assistant', content: reply });
    },
    onError: (error) => {
      addMessage({ role: 'assistant', content: errorReplyFor(error) });
    },
  });
}
