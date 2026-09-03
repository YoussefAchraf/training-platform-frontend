import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';

export function buildFeedbackSteps(_role: Role, t: TFunction<'tour'>): DriveStep[] {
  return [
    step('#tour-feedback-header', t('feedback.header.title'), t('feedback.header.text')),
    step('#tour-feedback-form', t('feedback.form.title'), t('feedback.form.text'), 'top'),
  ];
}
