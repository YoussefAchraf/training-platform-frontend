import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import type { Role } from '@/shared/types/domain';
import { step } from './helpers';

function buildSuperAdminSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('dashboard.superAdmin.welcome.title'), t('dashboard.superAdmin.welcome.text')),
    step('#tour-stat-total-users', t('dashboard.superAdmin.statTotalUsers.title'), t('dashboard.superAdmin.statTotalUsers.text')),
    step('#tour-stat-pending-signups', t('dashboard.superAdmin.statPendingSignups.title'), t('dashboard.superAdmin.statPendingSignups.text')),
    step('#tour-stat-deactivated', t('dashboard.superAdmin.statDeactivated.title'), t('dashboard.superAdmin.statDeactivated.text')),
    step('#tour-stat-total-sessions', t('dashboard.superAdmin.statTotalSessions.title'), t('dashboard.superAdmin.statTotalSessions.text')),
    step('#tour-quicklink-users', t('dashboard.superAdmin.quickLinkUsers.title'), t('dashboard.superAdmin.quickLinkUsers.text')),
    step('#tour-quicklink-sessions', t('dashboard.superAdmin.quickLinkSessions.title'), t('dashboard.superAdmin.quickLinkSessions.text')),
    step('#tour-quicklink-audit', t('dashboard.superAdmin.quickLinkAudit.title'), t('dashboard.superAdmin.quickLinkAudit.text')),
  ];
}

function buildManagerSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('dashboard.manager.welcome.title'), t('dashboard.manager.welcome.text')),
    step('#tour-stat-total-sessions', t('dashboard.manager.statTotalSessions.title'), t('dashboard.manager.statTotalSessions.text')),
    step('#tour-stat-needs-instructor', t('dashboard.manager.statNeedsInstructor.title'), t('dashboard.manager.statNeedsInstructor.text')),
    step('#tour-stat-instructors', t('dashboard.manager.statInstructors.title'), t('dashboard.manager.statInstructors.text')),
    step('#tour-stat-pending-approvals', t('dashboard.manager.statPendingApprovals.title'), t('dashboard.manager.statPendingApprovals.text')),
    step('#tour-card-needs-instructor', t('dashboard.manager.cardNeedsInstructor.title'), t('dashboard.manager.cardNeedsInstructor.text'), 'top'),
    step('#tour-card-upcoming-sessions', t('dashboard.manager.cardUpcomingSessions.title'), t('dashboard.manager.cardUpcomingSessions.text'), 'top'),
  ];
}

function buildSalesSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('dashboard.sales.welcome.title'), t('dashboard.sales.welcome.text')),
    step('#tour-stat-total-sessions', t('dashboard.sales.statTotalSessions.title'), t('dashboard.sales.statTotalSessions.text')),
    step('#tour-stat-providers', t('dashboard.sales.statProviders.title'), t('dashboard.sales.statProviders.text')),
    step('#tour-stat-trainings', t('dashboard.sales.statTrainings.title'), t('dashboard.sales.statTrainings.text')),
    step('#tour-stat-clients', t('dashboard.sales.statClients.title'), t('dashboard.sales.statClients.text')),
    step('#tour-card-awaiting-assignment', t('dashboard.sales.cardAwaitingAssignment.title'), t('dashboard.sales.cardAwaitingAssignment.text'), 'top'),
    step('#tour-card-upcoming-sessions', t('dashboard.sales.cardUpcomingSessions.title'), t('dashboard.sales.cardUpcomingSessions.text'), 'top'),
  ];
}

function buildInstructorSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('dashboard.instructor.welcome.title'), t('dashboard.instructor.welcome.text')),
    step('#tour-stat-my-sessions', t('dashboard.instructor.statMySessions.title'), t('dashboard.instructor.statMySessions.text')),
    step('#tour-stat-completed', t('dashboard.instructor.statCompleted.title'), t('dashboard.instructor.statCompleted.text')),
    step('#tour-stat-upcoming-accepted', t('dashboard.instructor.statUpcomingAccepted.title'), t('dashboard.instructor.statUpcomingAccepted.text')),
    step('#tour-card-recently-completed', t('dashboard.instructor.cardRecentlyCompleted.title'), t('dashboard.instructor.cardRecentlyCompleted.text'), 'top'),
    step('#tour-card-your-sessions', t('dashboard.instructor.cardYourSessions.title'), t('dashboard.instructor.cardYourSessions.text'), 'top'),
  ];
}

export function buildDashboardSteps(role: Role, t: TFunction<'tour'>): DriveStep[] {
  if (role === 'SuperAdmin') return buildSuperAdminSteps(t);
  if (role === 'Manager') return buildManagerSteps(t);
  if (role === 'Instructor') return buildInstructorSteps(t);
  return buildSalesSteps(t);
}
