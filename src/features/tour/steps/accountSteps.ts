import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';






export function buildAccountSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  const detailsKey = role === 'Instructor' ? 'account.detailsInstructor' : 'account.details';
  return [
    step('#tour-account-header', t('account.header.title'), t('account.header.text')),
    step('#tour-account-profile', t('account.profile.title'), t('account.profile.text'), 'top'),
    step('#tour-account-details', t(`${detailsKey}.title`), t(`${detailsKey}.text`), 'top'),
    step('#tour-account-notifications', t('account.notifications.title'), t('account.notifications.text'), 'top'),
  ];
}
