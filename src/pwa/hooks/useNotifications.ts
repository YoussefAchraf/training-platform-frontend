import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck2, CalendarClock, ClipboardCheck, UserCog } from 'lucide-react';
import type { ComponentType } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePendingUsers } from '@/features/auth/hooks/usePendingUsers';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { useNewAssignments } from '@/features/calendar/hooks/useNewAssignments';
import { formatDateTime } from '@/shared/utils/formatDate';
import { paths } from '@/routes/paths';
import type { Tone } from '@/shared/utils/statusMeta';

export interface AppNotification {
  id: string;
  icon: ComponentType<{ size?: number }>;
  tone: Tone;
  title: string;
  description: string;
  to: string;
}




const UPCOMING_WINDOW_MS = 48 * 60 * 60 * 1000;







export function useNotifications() {
  const { t } = useTranslation(['pwa', 'dashboard']);
  const { isInstructor, isManager, isSuperAdmin, canManageCatalog } = useAuth();

  const { newAssignments, markSeen } = useNewAssignments({ enabled: isInstructor });
  const pendingUsersQuery = usePendingUsers({ enabled: isManager || isSuperAdmin });
  
  
  
  const sessionsQuery = useSessions({ enabled: canManageCatalog || isInstructor });
  const { trainingMap, clientMap } = useSessionLookups();

  const canSeePendingSignups = isManager || isSuperAdmin;
  const pendingCount = canSeePendingSignups ? pendingUsersQuery.data?.length ?? 0 : 0;
  const unassignedSessions = canManageCatalog ? (sessionsQuery.data ?? []).filter((session) => session.assignmentStatus === 'unassigned') : [];

  const upcomingForInstructor = useMemo(() => {
    if (!isInstructor) return [];
    const now = new Date().getTime();
    return (sessionsQuery.data ?? [])
      .filter((session) => {
        if (session.assignmentStatus !== 'accepted') return false;
        if (session.sessionStatus !== 'scheduled' && session.sessionStatus !== 'ongoing') return false;
        const startsAt = new Date(session.startDate).getTime();
        return startsAt >= now && startsAt - now <= UPCOMING_WINDOW_MS;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [isInstructor, sessionsQuery.data]);

  const notifications = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];

    for (const session of newAssignments) {
      const trainingName = trainingMap.get(session.trainingId)?.name ?? t('dashboard:SessionMiniList.unnamedSession', { id: session.id });
      const clientName = clientMap.get(session.clientId)?.companyName ?? t('dashboard:SessionMiniList.unknownClient');
      items.push({
        id: `assignment-${session.id}`,
        icon: CalendarClock,
        tone: 'info',
        title: t('PwaNotifications.newAssignmentTitle'),
        description: `${trainingName} · ${clientName}`,
        to: paths.sessionDetail(session.id),
      });
    }

    for (const session of upcomingForInstructor) {
      const trainingName = trainingMap.get(session.trainingId)?.name ?? t('dashboard:SessionMiniList.unnamedSession', { id: session.id });
      const clientName = clientMap.get(session.clientId)?.companyName ?? t('dashboard:SessionMiniList.unknownClient');
      items.push({
        id: `upcoming-${session.id}`,
        icon: CalendarCheck2,
        tone: 'success',
        title: t('PwaNotifications.upcomingSessionTitle'),
        description: t('PwaNotifications.upcomingSessionDescription', {
          training: trainingName,
          client: clientName,
          when: formatDateTime(session.startDate),
        }),
        to: paths.sessionDetail(session.id),
      });
    }

    if (canSeePendingSignups && pendingCount > 0) {
      items.push({
        id: 'pending-signups',
        icon: ClipboardCheck,
        tone: 'warning',
        title: t('PwaNotifications.pendingSignupsTitle'),
        description: t('PwaNotifications.pendingSignupsDescription', { count: pendingCount }),
        to: paths.pendingApprovals,
      });
    }

    if (canManageCatalog && unassignedSessions.length > 0) {
      items.push({
        id: 'unassigned-sessions',
        icon: UserCog,
        tone: 'danger',
        title: t('PwaNotifications.unassignedSessionsTitle'),
        description: t('PwaNotifications.unassignedSessionsDescription', { count: unassignedSessions.length }),
        to: paths.sessions,
      });
    }

    return items;
  }, [newAssignments, upcomingForInstructor, trainingMap, clientMap, canSeePendingSignups, pendingCount, canManageCatalog, unassignedSessions.length, t]);

  // Bell badge counts individual actionable items, not notification cards -
  // "5" waiting instructors feels more native/useful than "1" grouped card.
  const totalCount = newAssignments.length + upcomingForInstructor.length + pendingCount + unassignedSessions.length;

  return { notifications, totalCount, markAssignmentsSeen: markSeen };
}
