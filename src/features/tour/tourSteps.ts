import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';

type Side = 'top' | 'right' | 'bottom' | 'left';

function step(element: string | undefined, title: string, text: string, side: Side = 'bottom'): DriveStep {
  return { element, popover: { title, description: text, side, align: 'start' } };
}


function replayStep(t: TFunction<'tour'>): DriveStep {
  return step('#tour-guide-button', t('replay.title'), t('replay.text'), 'left');
}

export function buildSuperAdminSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('superAdmin.welcome.title'), t('superAdmin.welcome.text')),
    step('#tour-stat-total-users', t('superAdmin.statTotalUsers.title'), t('superAdmin.statTotalUsers.text')),
    step('#tour-stat-pending-signups', t('superAdmin.statPendingSignups.title'), t('superAdmin.statPendingSignups.text')),
    step('#tour-stat-deactivated', t('superAdmin.statDeactivated.title'), t('superAdmin.statDeactivated.text')),
    step('#tour-stat-total-sessions', t('superAdmin.statTotalSessions.title'), t('superAdmin.statTotalSessions.text')),
    step('#tour-quicklink-users', t('superAdmin.quickLinkUsers.title'), t('superAdmin.quickLinkUsers.text')),
    step('#tour-quicklink-sessions', t('superAdmin.quickLinkSessions.title'), t('superAdmin.quickLinkSessions.text')),
    step('#tour-quicklink-audit', t('superAdmin.quickLinkAudit.title'), t('superAdmin.quickLinkAudit.text')),
    replayStep(t),
  ];
}

export function buildManagerSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('manager.welcome.title'), t('manager.welcome.text')),
    step('#tour-stat-total-sessions', t('manager.statTotalSessions.title'), t('manager.statTotalSessions.text')),
    step('#tour-stat-needs-instructor', t('manager.statNeedsInstructor.title'), t('manager.statNeedsInstructor.text')),
    step('#tour-stat-instructors', t('manager.statInstructors.title'), t('manager.statInstructors.text')),
    step('#tour-stat-pending-approvals', t('manager.statPendingApprovals.title'), t('manager.statPendingApprovals.text')),
    step('#tour-card-needs-instructor', t('manager.cardNeedsInstructor.title'), t('manager.cardNeedsInstructor.text'), 'top'),
    step('#tour-card-upcoming-sessions', t('manager.cardUpcomingSessions.title'), t('manager.cardUpcomingSessions.text'), 'top'),
    replayStep(t),
  ];
}

export function buildSalesSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('sales.welcome.title'), t('sales.welcome.text')),
    step('#tour-stat-total-sessions', t('sales.statTotalSessions.title'), t('sales.statTotalSessions.text')),
    step('#tour-stat-providers', t('sales.statProviders.title'), t('sales.statProviders.text')),
    step('#tour-stat-trainings', t('sales.statTrainings.title'), t('sales.statTrainings.text')),
    step('#tour-stat-clients', t('sales.statClients.title'), t('sales.statClients.text')),
    step('#tour-card-awaiting-assignment', t('sales.cardAwaitingAssignment.title'), t('sales.cardAwaitingAssignment.text'), 'top'),
    step('#tour-card-upcoming-sessions', t('sales.cardUpcomingSessions.title'), t('sales.cardUpcomingSessions.text'), 'top'),
    replayStep(t),
  ];
}

export function buildInstructorSteps(t: TFunction<'tour'>): DriveStep[] {
  return [
    step(undefined, t('instructor.welcome.title'), t('instructor.welcome.text')),
    step('#tour-stat-my-sessions', t('instructor.statMySessions.title'), t('instructor.statMySessions.text')),
    step('#tour-stat-completed', t('instructor.statCompleted.title'), t('instructor.statCompleted.text')),
    step('#tour-stat-upcoming-accepted', t('instructor.statUpcomingAccepted.title'), t('instructor.statUpcomingAccepted.text')),
    step('#tour-card-recently-completed', t('instructor.cardRecentlyCompleted.title'), t('instructor.cardRecentlyCompleted.text'), 'top'),
    step('#tour-card-your-sessions', t('instructor.cardYourSessions.title'), t('instructor.cardYourSessions.text'), 'top'),
    replayStep(t),
  ];
}
