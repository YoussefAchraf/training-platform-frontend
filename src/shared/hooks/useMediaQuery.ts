import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);

    handleChange();
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}


export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}



export function useIsIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const isClassicIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isModernIpad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isClassicIos || isModernIpad;
}

export function useIsStandalone(): boolean {
  const displayModeStandalone = useMediaQuery('(display-mode: standalone)');
  const iosStandalone =
    typeof navigator !== 'undefined' && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayModeStandalone || iosStandalone;
}


export function useIsSidebarCollapsed(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export type StandaloneDeviceClass = 'phone' | 'tablet' | 'desktop' | null;


export function useStandaloneDeviceClass(): StandaloneDeviceClass {
  const isStandalone = useIsStandalone();
  const isTabletUp = useMediaQuery('(min-width: 768px)');
  const isDesktopUp = useMediaQuery('(min-width: 1280px)');

  if (!isStandalone) return null;
  if (isDesktopUp) return 'desktop';
  if (isTabletUp) return 'tablet';
  return 'phone';
}
