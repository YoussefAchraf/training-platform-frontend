import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';





const CAN_MANAGE_CATALOG: Role[] = ['Sales', 'Manager', 'SuperAdmin'];

export function buildProvidersSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  const steps: DriveStep[] = [
    step('#tour-providers-header', t('providers.header.title'), t('providers.header.text')),
  ];
  if (CAN_MANAGE_CATALOG.includes(role)) {
    steps.push(step('#tour-providers-add', t('providers.add.title'), t('providers.add.text')));
  }
  steps.push(step('#tour-providers-table', t('providers.table.title'), t('providers.table.text'), 'top'));
  return steps;
}

export function buildTrainingsSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  const steps: DriveStep[] = [
    step('#tour-trainings-header', t('trainings.header.title'), t('trainings.header.text')),
  ];
  if (CAN_MANAGE_CATALOG.includes(role)) {
    steps.push(step('#tour-trainings-add', t('trainings.add.title'), t('trainings.add.text')));
  }
  steps.push(step('#tour-trainings-filter', t('trainings.filter.title'), t('trainings.filter.text')));
  steps.push(step('#tour-trainings-table', t('trainings.table.title'), t('trainings.table.text'), 'top'));
  return steps;
}

export function buildClientsSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  const steps: DriveStep[] = [
    step('#tour-clients-header', t('clients.header.title'), t('clients.header.text')),
  ];
  if (CAN_MANAGE_CATALOG.includes(role)) {
    steps.push(step('#tour-clients-add', t('clients.add.title'), t('clients.add.text')));
  }
  steps.push(step('#tour-clients-table', t('clients.table.title'), t('clients.table.text'), 'top'));
  return steps;
}
