import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaState {
  installPromptEvent: BeforeInstallPromptEvent | null;
  lastPromptedAt: string | null;
  dismissedPermanently: boolean;
  isInstalled: boolean;
  notificationsNudgeDismissed: boolean;
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void;
  recordPrompted: () => void;
  dismissPermanently: () => void;
  markInstalled: () => void;
  dismissNotificationsNudge: () => void;
}

export const usePwaStore = create<PwaState>()(
  persist(
    (set) => ({
      installPromptEvent: null,
      lastPromptedAt: null,
      dismissedPermanently: false,
      isInstalled: false,
      notificationsNudgeDismissed: false,
      setInstallPromptEvent: (event) => set({ installPromptEvent: event }),
      recordPrompted: () => set({ lastPromptedAt: new Date().toISOString() }),
      dismissPermanently: () => set({ dismissedPermanently: true }),
      markInstalled: () => set({ isInstalled: true, installPromptEvent: null }),
      dismissNotificationsNudge: () => set({ notificationsNudgeDismissed: true }),
    }),
    {
      name: 'training-platform-pwa',
      
      
      partialize: (state) => ({
        lastPromptedAt: state.lastPromptedAt,
        dismissedPermanently: state.dismissedPermanently,
        isInstalled: state.isInstalled,
        notificationsNudgeDismissed: state.notificationsNudgeDismissed,
      }),
    },
  ),
);
