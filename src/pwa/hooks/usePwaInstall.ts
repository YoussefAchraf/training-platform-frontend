import { useEffect } from 'react';
import { usePwaStore } from '../store/pwaStore';
import type { BeforeInstallPromptEvent } from '../store/pwaStore';
import { useIsFirefoxAndroid, useIsIos, useIsStandalone } from '@/shared/hooks/useMediaQuery';
import { usePushSubscription } from '@/features/push/hooks/usePushSubscription';

const PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; 


export function usePwaInstallListener() {
  const setInstallPromptEvent = usePwaStore((state) => state.setInstallPromptEvent);
  const markInstalled = usePwaStore((state) => state.markInstalled);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      
      
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => markInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setInstallPromptEvent, markInstalled]);
}

export function usePwaInstall() {
  const isStandalone = useIsStandalone();
  const installPromptEvent = usePwaStore((state) => state.installPromptEvent);
  const lastPromptedAt = usePwaStore((state) => state.lastPromptedAt);
  const dismissedPermanently = usePwaStore((state) => state.dismissedPermanently);
  const isInstalled = usePwaStore((state) => state.isInstalled);
  const setInstallPromptEvent = usePwaStore((state) => state.setInstallPromptEvent);
  const recordPrompted = usePwaStore((state) => state.recordPrompted);
  const dismissPermanently = usePwaStore((state) => state.dismissPermanently);
  const markInstalled = usePwaStore((state) => state.markInstalled);

  const dueForPrompt =
    !lastPromptedAt || Date.now() - new Date(lastPromptedAt).getTime() > PROMPT_COOLDOWN_MS;

  const canShowBanner =
    !isStandalone && !isInstalled && !dismissedPermanently && dueForPrompt && Boolean(installPromptEvent);

  const promptInstall = async () => {
    if (!installPromptEvent) return;
    recordPrompted();
    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      markInstalled();
    } else {
      setInstallPromptEvent(null);
    }
  };

  const dismiss = () => {
    recordPrompted();
  };

  return { canShowBanner, promptInstall, dismiss, dismissPermanently };
}


export function useIosInstallHint() {
  const isIos = useIsIos();
  const isStandalone = useIsStandalone();
  const lastPromptedAt = usePwaStore((state) => state.lastPromptedAt);
  const dismissedPermanently = usePwaStore((state) => state.dismissedPermanently);
  const recordPrompted = usePwaStore((state) => state.recordPrompted);

  const dueForPrompt =
    !lastPromptedAt || Date.now() - new Date(lastPromptedAt).getTime() > PROMPT_COOLDOWN_MS;

  const canShowHint = isIos && !isStandalone && !dismissedPermanently && dueForPrompt;

  const dismiss = () => recordPrompted();

  return { canShowHint, dismiss };
}


export function useFirefoxInstallHint() {
  const isFirefoxAndroid = useIsFirefoxAndroid();
  const isStandalone = useIsStandalone();
  const lastPromptedAt = usePwaStore((state) => state.lastPromptedAt);
  const dismissedPermanently = usePwaStore((state) => state.dismissedPermanently);
  const recordPrompted = usePwaStore((state) => state.recordPrompted);

  const dueForPrompt =
    !lastPromptedAt || Date.now() - new Date(lastPromptedAt).getTime() > PROMPT_COOLDOWN_MS;

  const canShowHint = isFirefoxAndroid && !isStandalone && !dismissedPermanently && dueForPrompt;

  const dismiss = () => recordPrompted();

  return { canShowHint, dismiss };
}


export function useIosNotificationsNudge() {
  const isIos = useIsIos();
  const isStandalone = useIsStandalone();
  const dismissed = usePwaStore((state) => state.notificationsNudgeDismissed);
  const dismissNotificationsNudge = usePwaStore((state) => state.dismissNotificationsNudge);
  const { status, subscribe } = usePushSubscription();

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  const canShowNudge = isIos && isStandalone && status === 'unsubscribed' && permission === 'default' && !dismissed;

  const enable = async () => {
    await subscribe();
    dismissNotificationsNudge();
  };

  return { canShowNudge, enable, dismiss: dismissNotificationsNudge };
}
