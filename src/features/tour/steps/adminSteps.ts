import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';

export function buildPendingApprovalsSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role !== 'Manager' && role !== 'SuperAdmin') return [];
  return [
    step('#tour-pending-header', t('pendingApprovals.header.title'), t('pendingApprovals.header.text')),
    step('#tour-pending-table', t('pendingApprovals.table.title'), t('pendingApprovals.table.text'), 'top'),
  ];
}

export function buildAuditLogSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role !== 'Manager' && role !== 'SuperAdmin') return [];
  const filterKey = role === 'SuperAdmin' ? 'auditLog.filtersSuperAdmin' : 'auditLog.filtersManager';
  return [
    step('#tour-audit-header', t('auditLog.header.title'), t('auditLog.header.text')),
    step('#tour-audit-filters', t(`${filterKey}.title`), t(`${filterKey}.text`)),
    step('#tour-audit-list', t('auditLog.list.title'), t('auditLog.list.text'), 'top'),
  ];
}

export function buildUsersSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role !== 'SuperAdmin') return [];
  return [
    step('#tour-users-header', t('users.header.title'), t('users.header.text')),
    step('#tour-users-table', t('users.table.title'), t('users.table.text'), 'top'),
  ];
}

export function buildSessionsOverviewSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role !== 'SuperAdmin') return [];
  return [
    step('#tour-sessionsoverview-header', t('sessionsOverview.header.title'), t('sessionsOverview.header.text')),
    step('#tour-sessionsoverview-table', t('sessionsOverview.table.title'), t('sessionsOverview.table.text'), 'top'),
  ];
}
