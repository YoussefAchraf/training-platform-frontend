import { useEffect, useRef } from 'react';
import { useIsIos } from '@/shared/hooks/useMediaQuery';
import { usePushSubscription } from './usePushSubscription';

export function useAutoEnableNotifications() {
  const { status, subscribe } = usePushSubscription();
  const attempted = useRef(false);
  const isIos = useIsIos();

  useEffect(() => {
    if (attempted.current) return;
    if (status !== 'unsubscribed') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
    
    
    
    
    
    
    if (isIos) return;

    attempted.current = true;
    void subscribe();
  }, [status, subscribe, isIos]);
}
