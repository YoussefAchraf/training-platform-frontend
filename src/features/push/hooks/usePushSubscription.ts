import { useEffect, useState } from 'react';
import { pushApi } from '../api/pushApi';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;




function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushSupportStatus = 'unsupported' | 'checking' | 'subscribed' | 'unsubscribed';

export function usePushSubscription() {
  const [status, setStatus] = useState<PushSupportStatus>('checking');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && Boolean(VAPID_PUBLIC_KEY);

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? 'subscribed' : 'unsubscribed'))
      .catch(() => setStatus('unsubscribed'));
  }, [isSupported]);

  const subscribe = async (): Promise<boolean> => {
    setError(null);
    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notifications permission was not granted.');
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
    } catch {
      setError('Could not enable notifications. Please try again.');
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
    } catch {
      setError('Could not disable notifications. Please try again.');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  return { status, isBusy, error, subscribe, unsubscribe };
}
