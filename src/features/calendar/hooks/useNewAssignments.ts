import { useMemo } from 'react';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSeenAssignmentsStore } from '../store/seenAssignmentsStore';






export function useNewAssignments(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const sessionsQuery = useSessions({ enabled });
  const seenSessionIds = useSeenAssignmentsStore((state) => state.seenSessionIds);
  const markSeen = useSeenAssignmentsStore((state) => state.markSeen);

  const newAssignments = useMemo(() => {
    
    
    
    
    
    if (!enabled) return [];
    const seen = new Set(seenSessionIds);
    return (sessionsQuery.data ?? [])
      .filter(
        (session) =>
          session.assignmentStatus === 'accepted' &&
          (session.sessionStatus === 'scheduled' || session.sessionStatus === 'ongoing') &&
          !seen.has(session.id),
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [enabled, sessionsQuery.data, seenSessionIds]);

  return { newAssignments, isPending: sessionsQuery.isPending, markSeen };
}
