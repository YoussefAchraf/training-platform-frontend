import { useCallback } from 'react';
import type { ComponentType } from 'react';
import { paths } from './paths';

type PageModule = () => Promise<{ default: ComponentType<Record<string, never>> }>;


export const routeModules: Record<string, PageModule> = {
  [paths.login]: () => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
  [paths.signup]: () => import('@/features/auth/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
  [paths.pendingApproval]: () =>
    import('@/features/auth/pages/PendingApprovalPage').then((m) => ({ default: m.PendingApprovalPage })),
  [paths.account]: () => import('@/features/auth/pages/AccountPage').then((m) => ({ default: m.AccountPage })),
  [paths.chat]: () => import('@/pwa/pages/PwaChatPage').then((m) => ({ default: m.PwaChatPage })),
  [paths.pwaProfile]: () => import('@/pwa/pages/PwaProfilePage').then((m) => ({ default: m.PwaProfilePage })),
  [paths.providers]: () =>
    import('@/features/providers/pages/ProvidersPage').then((m) => ({ default: m.ProvidersPage })),
  [paths.clients]: () => import('@/features/clients/pages/ClientsPage').then((m) => ({ default: m.ClientsPage })),
  [paths.trainings]: () =>
    import('@/features/trainings/pages/TrainingsPage').then((m) => ({ default: m.TrainingsPage })),
  [paths.instructors]: () =>
    import('@/features/instructors/pages/InstructorsPage').then((m) => ({ default: m.InstructorsPage })),
  [paths.myInstructorProfile]: () =>
    import('@/features/instructors/pages/MyInstructorProfilePage').then((m) => ({
      default: m.MyInstructorProfilePage,
    })),
  [paths.calendar]: () =>
    import('@/features/calendar/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })),
  [paths.sessions]: () =>
    import('@/features/sessions/pages/SessionsPage').then((m) => ({ default: m.SessionsPage })),
  [paths.pendingApprovals]: () =>
    import('@/features/admin/pages/PendingApprovalsPage').then((m) => ({ default: m.PendingApprovalsPage })),
  [paths.auditLog]: () => import('@/features/admin/pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
  [paths.superAdminUsers]: () =>
    import('@/features/admin/pages/SuperAdminUsersPage').then((m) => ({ default: m.SuperAdminUsersPage })),
  [paths.superAdminSessions]: () =>
    import('@/features/admin/pages/SuperAdminSessionsPage').then((m) => ({ default: m.SuperAdminSessionsPage })),
  [paths.superAdminLogin]: () =>
    import('@/features/auth/pages/SuperAdminLoginPage').then((m) => ({ default: m.SuperAdminLoginPage })),
};

const prefetched = new Set<string>();

function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  const loader = routeModules[path];
  if (!loader) return;
  prefetched.add(path);
  loader().catch(() => {
    prefetched.delete(path);
  });
}

export function usePrefetchRoute() {
  return useCallback((path: string) => prefetchRoute(path), []);
}


export function prefetchRoutesIdle(paths: string[]): void {
  const schedule =
    typeof requestIdleCallback === 'function' ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 1000);

  schedule(() => {
    for (const path of paths) prefetchRoute(path);
  });
}
