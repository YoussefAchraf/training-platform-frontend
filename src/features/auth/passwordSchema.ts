import { z } from 'zod';
import type { TFunction } from 'i18next';




export function newPasswordRule(t: TFunction<'auth'>) {
  return z
    .string()
    .min(10, t('PasswordRules.tooShort'))
    .regex(/[a-zA-Z]/, t('PasswordRules.needsLetter'))
    .regex(/[0-9]/, t('PasswordRules.needsNumber'));
}
