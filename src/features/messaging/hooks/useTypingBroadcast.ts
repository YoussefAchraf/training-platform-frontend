import { useCallback, useEffect, useRef } from 'react';
import { getMessagingSocket } from '../api/socket';

const STOP_DELAY_MS = 4000;

export function useTypingBroadcast(conversationId: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    getMessagingSocket().emit('typing:stop', { conversationId });
  }, [conversationId]);

  const notifyTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      getMessagingSocket().emit('typing:start', { conversationId });
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(stopTyping, STOP_DELAY_MS);
  }, [conversationId, stopTyping]);

  useEffect(() => stopTyping, [stopTyping, conversationId]);

  return { notifyTyping, stopTyping };
}
