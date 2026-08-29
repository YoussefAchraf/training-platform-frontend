import { useCallback, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import type { Driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tourTheme.css';
import { useTranslation } from 'react-i18next';



export function useTour() {
  const { t } = useTranslation('tour');
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  const startTour = useCallback(
    (steps: DriveStep[]) => {
      driverRef.current?.destroy();
      const instance = driver({
        steps,
        showProgress: true,
        allowClose: true,
        overlayOpacity: 0.6,
        stagePadding: 6,
        stageRadius: 10,
        smoothScroll: true,
        animate: true,
        waitForElement: 4000,
        skipMissingElement: true,
        nextBtnText: t('buttons.next'),
        prevBtnText: t('buttons.back'),
        doneBtnText: t('buttons.done'),
        progressText: t('buttons.progress'),
      });
      driverRef.current = instance;
      instance.drive();
    },
    [t],
  );

  return { startTour };
}
