import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { urlBase64ToUint8Array } from '@/shared/utils/webPush';
import { pushApi } from '../api/pushApi';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export type PushSupportStatus = 'unsupported' | 'checking' | 'subscribed' | 'unsubscribed';

export function usePushSubscription() {
  const { t } = useTranslation('common');
  const [status, setStatus] = useState<PushSupportStatus>('checking');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && Boolean(VAPID_PUBLIC_KEY);

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        
        
        
        
        
        
        if (!subscription && Notification.permission === 'granted') {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
          });
        }

        if (subscription) {
          
          
          
          
          
          
          
          
          
          const json = subscription.toJSON();
          await pushApi.subscribe({
            endpoint: json.endpoint!,
            keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
            silent: true,
          });
        }

        if (!cancelled) setStatus(subscription ? 'subscribed' : 'unsubscribed');
      } catch {
        if (!cancelled) setStatus('unsubscribed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSupported]);

  const subscribe = async (): Promise<boolean> => {
    setError(null);
    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError(t('PushNotifications.permissionDenied'));
        return false;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        
        
        
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
      });
      const json = subscription.toJSON();
      await pushApi.subscribe({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setStatus('subscribed');
      return true;
    } catch (err) {
      console.error('[usePushSubscription] Failed to subscribe:', err);
      setError(t('PushNotifications.enableFailed'));
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setError(null);
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await pushApi.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus('unsubscribed');
      return true;
    } catch (err) {
      console.error('[usePushSubscription] Failed to unsubscribe:', err);
      setError(t('PushNotifications.disableFailed'));
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  return { status, isBusy, error, subscribe, unsubscribe };
}
