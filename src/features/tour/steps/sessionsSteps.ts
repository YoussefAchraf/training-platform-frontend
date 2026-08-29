import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';




export function buildSessionsListSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role === 'Instructor') return [];
  
  
  const steps: DriveStep[] = [
    step('#tour-sessions-header', t('sessions.list.header.title'), t('sessions.list.header.text')),
    step('#tour-sessions-add', t('sessions.list.add.title'), t('sessions.list.add.text')),
    step('#tour-sessions-table', t('sessions.list.table.title'), t('sessions.list.table.text'), 'top'),
  ];
  return steps;
}







export function buildSessionDetailSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role === 'SuperAdmin') {
    return [
      step('#tour-session-header', t('sessionDetail.superAdmin.header.title'), t('sessionDetail.superAdmin.header.text')),
      step('#tour-session-assign', t('sessionDetail.superAdmin.assign.title'), t('sessionDetail.superAdmin.assign.text')),
      step('#tour-session-edit', t('sessionDetail.superAdmin.edit.title'), t('sessionDetail.superAdmin.edit.text')),
      step('#tour-session-details', t('sessionDetail.common.details.title'), t('sessionDetail.common.details.text'), 'top'),
      step('#tour-session-attendees', t('sessionDetail.superAdmin.attendees.title'), t('sessionDetail.superAdmin.attendees.text'), 'top'),
      step('#tour-session-report', t('sessionDetail.superAdmin.report.title'), t('sessionDetail.superAdmin.report.text'), 'top'),
    ];
  }
  if (role === 'Manager') {
    return [
      step('#tour-session-header', t('sessionDetail.manager.header.title'), t('sessionDetail.manager.header.text')),
      step('#tour-session-assign', t('sessionDetail.manager.assign.title'), t('sessionDetail.manager.assign.text')),
      step('#tour-session-details', t('sessionDetail.common.details.title'), t('sessionDetail.common.details.text'), 'top'),
      step('#tour-session-attendees', t('sessionDetail.manager.attendees.title'), t('sessionDetail.manager.attendees.text'), 'top'),
      step('#tour-session-report', t('sessionDetail.manager.report.title'), t('sessionDetail.manager.report.text'), 'top'),
    ];
  }
  if (role === 'Instructor') {
    return [
      step('#tour-session-header', t('sessionDetail.instructor.header.title'), t('sessionDetail.instructor.header.text')),
      step('#tour-session-qr', t('sessionDetail.instructor.qr.title'), t('sessionDetail.instructor.qr.text')),
      step('#tour-session-details', t('sessionDetail.common.details.title'), t('sessionDetail.common.details.text'), 'top'),
      step('#tour-session-attendees', t('sessionDetail.instructor.attendees.title'), t('sessionDetail.instructor.attendees.text'), 'top'),
      step('#tour-session-report', t('sessionDetail.instructor.report.title'), t('sessionDetail.instructor.report.text'), 'top'),
    ];
  }
  
  return [
    step('#tour-session-header', t('sessionDetail.sales.header.title'), t('sessionDetail.sales.header.text')),
    step('#tour-session-details', t('sessionDetail.common.details.title'), t('sessionDetail.common.details.text'), 'top'),
    step('#tour-session-attendees', t('sessionDetail.sales.attendees.title'), t('sessionDetail.sales.attendees.text'), 'top'),
    step('#tour-session-report', t('sessionDetail.sales.report.title'), t('sessionDetail.sales.report.text'), 'top'),
  ];
}
