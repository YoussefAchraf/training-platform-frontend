import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';

export function buildCalendarSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  const manages = role !== 'Instructor';
  const headerKey = manages ? 'calendar.headerManage' : 'calendar.headerOther';
  const bodyKey = manages ? 'calendar.bodyManage' : 'calendar.bodyOther';
  return [
    step('#tour-calendar-header', t(`${headerKey}.title`), t(`${headerKey}.text`)),
    step('#tour-calendar-toggle', t('calendar.toggle.title'), t('calendar.toggle.text'), 'left'),
    step('#tour-calendar-body', t(`${bodyKey}.title`), t(`${bodyKey}.text`), 'top'),
  ];
}
