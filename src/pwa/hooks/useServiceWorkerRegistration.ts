import { useEffect } from 'react';
import { Workbox } from 'workbox-window';
import { useToast } from '@/shared/hooks/useToast';


export function useServiceWorkerRegistration(): void {
  const toast = useToast();

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

    const wb = new Workbox('/sw.js');

    wb.addEventListener('waiting', () => {
      toast.info('A new version is available.', {
        persistent: true,
        action: {
          label: 'Refresh',
          onClick: () => {
            wb.addEventListener('controlling', () => window.location.reload());
            wb.messageSkipWaiting();
          },
        },
      });
    });

    wb.register().catch((error: unknown) => {
      
      
      
      console.error('Service worker registration failed:', error);
    });
  }, [toast]);
}
