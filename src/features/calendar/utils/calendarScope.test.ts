import { describe, expect, it } from 'vitest';
import { sessionIdsByCreator, sessionIdsByInstructor } from './calendarScope';

describe('sessionIdsByCreator', () => {
  it('collects only the ids of sessions created by the given user', () => {
    const sessions = [
      { id: 1, createdBy: 4 },
      { id: 2, createdBy: 7 },
      { id: 3, createdBy: 4 },
    ];
    expect(sessionIdsByCreator(sessions, 4)).toEqual(new Set([1, 3]));
  });

  it('returns an empty set when nothing matches', () => {
    const sessions = [{ id: 1, createdBy: 4 }];
    expect(sessionIdsByCreator(sessions, 999)).toEqual(new Set());
  });

  it('ignores sessions with a null creator', () => {
    const sessions = [{ id: 1, createdBy: null }];
    expect(sessionIdsByCreator(sessions, 4)).toEqual(new Set());
  });

  it('returns an empty set for an empty session list', () => {
    expect(sessionIdsByCreator([], 4)).toEqual(new Set());
  });
});

describe('sessionIdsByInstructor', () => {
  it('collects only the ids of sessions assigned to the given instructor', () => {
    const sessions = [
      { id: 1, instructorId: 31 },
      { id: 2, instructorId: 32 },
      { id: 3, instructorId: 31 },
    ];
    expect(sessionIdsByInstructor(sessions, 31)).toEqual(new Set([1, 3]));
  });

  it('ignores unassigned sessions (instructorId null)', () => {
    const sessions = [{ id: 1, instructorId: null }];
    expect(sessionIdsByInstructor(sessions, 31)).toEqual(new Set());
  });

  it('returns an empty set for an empty session list', () => {
    expect(sessionIdsByInstructor([], 31)).toEqual(new Set());
  });
});
