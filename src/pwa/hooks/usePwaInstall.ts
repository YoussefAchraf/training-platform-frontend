import { useEffect } from 'react';
import { usePwaStore } from '../store/pwaStore';
import type { BeforeInstallPromptEvent } from '../store/pwaStore';
import { useIsIos, useIsStandalone } from '@/shared/hooks/useMediaQuery';

const PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; 

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
