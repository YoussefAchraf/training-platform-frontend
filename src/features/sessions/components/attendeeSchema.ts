import { z } from 'zod';
import type { TFunction } from 'i18next';






export function buildAttendeeSchema(t: TFunction<'sessions'>) {
  return z.object({
    name: z.string().trim().min(1, t('AddAttendeeForm.errors.nameRequired')).max(150),
    email: z.union([z.email(t('AddAttendeeForm.errors.emailInvalid')), z.literal('')]).optional(),
  });
}

export type AttendeeFormValues = z.infer<ReturnType<typeof buildAttendeeSchema>>;
