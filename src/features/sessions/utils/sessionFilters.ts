import type { Client, Instructor, SessionLocationType, SessionStatus, Training, TrainingSession } from '@/shared/types/domain';

export interface SessionFilters {
  search: string;
  status: SessionStatus | 'all';
  location: SessionLocationType | 'all';
  instructorId: number | 'all';
}

export const defaultSessionFilters: SessionFilters = {
  search: '',
  status: 'all',
  location: 'all',
  instructorId: 'all',
};

export function hasActiveSessionFilters(filters: SessionFilters): boolean {
  return filters.search.trim() !== '' || filters.status !== 'all' || filters.location !== 'all' || filters.instructorId !== 'all';
}

interface SessionLookups {
  trainingMap: Map<number, Training>;
  clientMap: Map<number, Client>;
  instructorMap: Map<number, Instructor>;
}





export function filterSessions(sessions: TrainingSession[], filters: SessionFilters, lookups: SessionLookups): TrainingSession[] {
  const search = filters.search.trim().toLowerCase();

  return sessions.filter((session) => {
    if (filters.status !== 'all' && session.sessionStatus !== filters.status) return false;
    if (filters.location !== 'all' && session.locationType !== filters.location) return false;
    if (filters.instructorId !== 'all' && session.instructorId !== filters.instructorId) return false;

    if (search) {
      const trainingName = lookups.trainingMap.get(session.trainingId)?.name ?? '';
      const clientName = lookups.clientMap.get(session.clientId)?.companyName ?? '';
      const instructor = session.instructorId != null ? lookups.instructorMap.get(session.instructorId) : undefined;
      const instructorName = instructor ? `${instructor.firstname} ${instructor.lastname}` : '';
      const haystack = `${trainingName} ${clientName} ${instructorName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}
