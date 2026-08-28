import { useEffect, useRef } from 'react';
import { usePushSubscription } from './usePushSubscription';


export function useAutoEnableNotifications() {
  const { status, subscribe } = usePushSubscription();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (status !== 'unsubscribed') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;

    attempted.current = true;
    void subscribe();
  }, [status, subscribe]);
}
