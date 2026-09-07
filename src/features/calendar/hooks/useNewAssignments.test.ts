import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNewAssignments } from './useNewAssignments';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import type { TrainingSession } from '@/shared/types/domain';

vi.mock('@/features/sessions/hooks/useSessions');

const mockedUseSessions = vi.mocked(useSessions);

function makeSession(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: 1,
    trainingId: 1,
    clientId: 1,
    instructorId: 5,
    startDate: '2026-09-20T09:00:00.000Z',
    endDate: '2026-09-20T17:00:00.000Z',
    sessionStatus: 'scheduled',
    assignmentStatus: 'accepted',
    includeWeekends: false,
    locationType: 'onsite',
    createdBy: 1,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useNewAssignments', () => {
  
  
  
  
  
  
  it('returns no assignments when disabled, even if useSessions already has cached data', () => {
    mockedUseSessions.mockReturnValue({
      data: [makeSession({ id: 1 }), makeSession({ id: 2 })],
      isPending: false,
    } as ReturnType<typeof useSessions>);

    const { result } = renderHook(() => useNewAssignments({ enabled: false }));

    expect(result.current.newAssignments).toEqual([]);
  });

  it('returns matching assignments when enabled', () => {
    mockedUseSessions.mockReturnValue({
      data: [makeSession({ id: 1 })],
      isPending: false,
    } as ReturnType<typeof useSessions>);

    const { result } = renderHook(() => useNewAssignments({ enabled: true }));

    expect(result.current.newAssignments.map((session) => session.id)).toEqual([1]);
  });

  it('defaults to enabled when no options are passed', () => {
    mockedUseSessions.mockReturnValue({
      data: [makeSession({ id: 1 })],
      isPending: false,
    } as ReturnType<typeof useSessions>);

    const { result } = renderHook(() => useNewAssignments());

    expect(result.current.newAssignments.map((session) => session.id)).toEqual([1]);
  });
});
