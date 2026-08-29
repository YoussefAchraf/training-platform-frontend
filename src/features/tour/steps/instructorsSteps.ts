import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';



export function buildInstructorsListSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role === 'Instructor') return [];
  const steps: DriveStep[] = [
    step('#tour-instructors-header', t('instructors.header.title'), t('instructors.header.text')),
  ];
  if (role === 'Manager' || role === 'SuperAdmin') {
    steps.push(step('#tour-instructors-table', t('instructors.tableEdit.title'), t('instructors.tableEdit.text'), 'top'));
  } else {
    steps.push(step('#tour-instructors-table', t('instructors.tableReadOnly.title'), t('instructors.tableReadOnly.text'), 'top'));
  }
  return steps;
}

export function buildMyInstructorProfileSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role !== 'Instructor') return [];
  return [
    step('#tour-myprofile-header', t('myProfile.header.title'), t('myProfile.header.text')),
    step('#tour-myprofile-card', t('myProfile.card.title'), t('myProfile.card.text'), 'top'),
  ];
}
