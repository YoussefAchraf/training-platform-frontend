import { useCallback } from 'react';
import { getMessagingSocket } from '../api/socket';

export function useRecordingBroadcast(conversationId: number) {
  const notifyRecordingStart = useCallback(() => {
    getMessagingSocket().emit('recording:start', { conversationId });
  }, [conversationId]);

  const notifyRecordingStop = useCallback(() => {
    getMessagingSocket().emit('recording:stop', { conversationId });
  }, [conversationId]);

  return { notifyRecordingStart, notifyRecordingStop };
}
