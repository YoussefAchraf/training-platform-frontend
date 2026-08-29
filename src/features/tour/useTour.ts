import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { driver } from 'driver.js';
import type { Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tourTheme.css';
import type { Role } from '@/shared/types/domain';
import { buildInstructorSteps, buildManagerSteps, buildSalesSteps, buildSuperAdminSteps } from './tourSteps';

function stepsForRole(role: Role | undefined, t: ReturnType<typeof useTranslation<'tour'>>['t']) {
  if (role === 'SuperAdmin') return buildSuperAdminSteps(t);
  if (role === 'Manager') return buildManagerSteps(t);
  if (role === 'Instructor') return buildInstructorSteps(t);
  return buildSalesSteps(t);
}


export function useTour() {
  const { t } = useTranslation('tour');
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  const startTour = useCallback(
    (role: Role | undefined) => {
      driverRef.current?.destroy();
      const instance = driver({
        steps: stepsForRole(role, t),
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
