import { matchPath } from 'react-router-dom';
import type { DriveStep } from 'driver.js';
import type { TFunction } from 'i18next';
import { paths } from '@/routes/paths';
import type { Role } from '@/shared/types/domain';
import { step } from './steps/helpers';
import { buildDashboardSteps } from './steps/dashboardSteps';
import { buildClientsSteps, buildProvidersSteps, buildTrainingsSteps } from './steps/catalogSteps';
import { buildSessionDetailSteps, buildSessionsListSteps } from './steps/sessionsSteps';
import { buildInstructorsListSteps, buildMyInstructorProfileSteps } from './steps/instructorsSteps';
import {
  buildAuditLogSteps,
  buildPendingApprovalsSteps,
  buildSessionsOverviewSteps,
  buildUsersSteps,
} from './steps/adminSteps';
import { buildCalendarSteps } from './steps/calendarSteps';
import { buildAccountSteps } from './steps/accountSteps';

type Builder = (role: Role, t: TFunction<'tour'>) => DriveStep[];

interface TourRoute {
  pattern: string;
  build: Builder;
}




const TOUR_ROUTES: TourRoute[] = [
  { pattern: paths.dashboard, build: buildDashboardSteps },
  { pattern: paths.calendar, build: buildCalendarSteps },
  { pattern: paths.providers, build: buildProvidersSteps },
  { pattern: paths.trainings, build: buildTrainingsSteps },
  { pattern: paths.clients, build: buildClientsSteps },
  { pattern: paths.sessions, build: buildSessionsListSteps },
  { pattern: '/sessions/:id', build: buildSessionDetailSteps },
  { pattern: paths.instructors, build: buildInstructorsListSteps },
  { pattern: paths.myInstructorProfile, build: buildMyInstructorProfileSteps },
  { pattern: paths.pendingApprovals, build: buildPendingApprovalsSteps },
  { pattern: paths.auditLog, build: buildAuditLogSteps },
  { pattern: paths.superAdminUsers, build: buildUsersSteps },
  { pattern: paths.superAdminSessions, build: buildSessionsOverviewSteps },
  { pattern: paths.account, build: buildAccountSteps },
];

export function withReplayStep(steps: DriveStep[], t: TFunction<'tour'>): DriveStep[] {
  return [...steps, step('#tour-guide-button', t('replay.title'), t('replay.text'), 'left')];
}




export function resolveTourSteps(pathname: string, role: Role | undefined, t: TFunction<'tour'>): DriveStep[] | null {
  if (!role) return null;
  for (const route of TOUR_ROUTES) {
    if (matchPath({ path: route.pattern, end: true }, pathname)) {
      const steps = route.build(role, t);
      if (steps.length === 0) return null;
      return withReplayStep(steps, t);
    }
  }
  return null;
}
