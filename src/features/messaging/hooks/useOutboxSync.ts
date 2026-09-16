import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMessagingSocket } from '../api/socket';
import { listOutboxEntries } from '../outbox/outboxDb';
import { sendPendingEntry } from '../outbox/outboxEngine';
import { useCanUseMessaging } from './useConversations';

export function useOutboxSync(): void {
  const { isAuthenticated } = useAuth();
  const canUseMessaging = useCanUseMessaging();
  const eligible = isAuthenticated && canUseMessaging;
  const drainingRef = useRef(false);

  useEffect(() => {
    if (!eligible) return undefined;

    async function drain() {
      if (drainingRef.current) return;
      drainingRef.current = true;
      try {
        const entries = await listOutboxEntries();
        for (const entry of entries) {
          if (entry.status === 'failed') continue;
          try {
            await sendPendingEntry(entry);
          } catch {
            break;
          }
        }
      } finally {
        drainingRef.current = false;
      }
    }

    drain();
    const socket = getMessagingSocket();
    window.addEventListener('online', drain);
    socket.on('connect', drain);
    return () => {
      window.removeEventListener('online', drain);
      socket.off('connect', drain);
    };
  }, [eligible]);
}
