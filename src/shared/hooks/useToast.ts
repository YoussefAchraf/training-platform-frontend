import { useCallback, useMemo } from 'react';
import { useUiStore } from '@/shared/store/uiStore';
import type { ShowToastOptions } from '@/shared/store/uiStore';

export function useToast() {
  const showToast = useUiStore((state) => state.showToast);

  const success = useCallback(
    (message: string, options?: ShowToastOptions) => showToast('success', message, options),
    [showToast],
  );
  const error = useCallback(
    (message: string, options?: ShowToastOptions) => showToast('error', message, options),
    [showToast],
  );
  const info = useCallback(
    (message: string, options?: ShowToastOptions) => showToast('info', message, options),
    [showToast],
  );

  return useMemo(() => ({ success, error, info }), [success, error, info]);
}
