import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';

export function buildMessagingSteps(_role: Role, t: TFunction<'tour'>): DriveStep[] {
  return [
    step('#tour-messages-header', t('messaging.header.title'), t('messaging.header.text')),
    step('#tour-messages-list', t('messaging.list.title'), t('messaging.list.text'), 'bottom'),
  ];
}
