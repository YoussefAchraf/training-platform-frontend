import { describe, expect, it } from 'vitest';
import type { Client, Instructor, Training, TrainingSession } from '@/shared/types/domain';
import { defaultSessionFilters, filterSessions, hasActiveSessionFilters } from './sessionFilters';

function makeSession(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: 1,
    trainingId: 1,
    clientId: 1,
    instructorId: null,
    startDate: '2026-09-20T09:00:00.000Z',
    endDate: '2026-09-20T17:00:00.000Z',
    sessionStatus: 'scheduled',
    assignmentStatus: 'unassigned',
    includeWeekends: false,
    locationType: 'onsite',
    createdBy: 1,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

const trainingMap = new Map<number, Training>([
  [1, { id: 1, name: 'RHCE', providerId: 1, providerName: 'Red Hat', description: null, duration: 5, durationUnit: 'days', createdBy: null, creatorName: null, createdAt: '' }],
  [2, { id: 2, name: 'CompTIA Security+', providerId: 2, providerName: 'CompTIA', description: null, duration: 3, durationUnit: 'days', createdBy: null, creatorName: null, createdAt: '' }],
]);
const clientMap = new Map<number, Client>([
  [1, { id: 1, companyName: 'Acme Corp', email: null, phone: null, country: 'FR', createdBy: null, creatorName: null, createdAt: '' }],
  [2, { id: 2, companyName: 'Globex', email: null, phone: null, country: 'EG', createdBy: null, creatorName: null, createdAt: '' }],
]);
const instructorMap = new Map<number, Instructor>([
  [1, { id: 1, userId: 1, bio: null, firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com', skills: [] }],
]);
const lookups = { trainingMap, clientMap, instructorMap };

describe('filterSessions', () => {
  it('returns every session when no filters are active', () => {
    const sessions = [makeSession({ id: 1 }), makeSession({ id: 2 })];
    expect(filterSessions(sessions, defaultSessionFilters, lookups)).toHaveLength(2);
  });

  it('filters by session status', () => {
    const sessions = [makeSession({ id: 1, sessionStatus: 'scheduled' }), makeSession({ id: 2, sessionStatus: 'completed' })];
    const result = filterSessions(sessions, { ...defaultSessionFilters, status: 'completed' }, lookups);
    expect(result.map((s) => s.id)).toEqual([2]);
  });

  it('filters by location type', () => {
    const sessions = [makeSession({ id: 1, locationType: 'onsite' }), makeSession({ id: 2, locationType: 'remote' })];
    const result = filterSessions(sessions, { ...defaultSessionFilters, location: 'remote' }, lookups);
    expect(result.map((s) => s.id)).toEqual([2]);
  });

  it('filters by instructor id', () => {
    const sessions = [makeSession({ id: 1, instructorId: 1 }), makeSession({ id: 2, instructorId: null })];
    const result = filterSessions(sessions, { ...defaultSessionFilters, instructorId: 1 }, lookups);
    expect(result.map((s) => s.id)).toEqual([1]);
  });

  it('searches training name, client name, and instructor name case-insensitively', () => {
    const sessions = [
      makeSession({ id: 1, trainingId: 1, clientId: 1, instructorId: 1 }),
      makeSession({ id: 2, trainingId: 2, clientId: 2, instructorId: null }),
    ];
    expect(filterSessions(sessions, { ...defaultSessionFilters, search: 'rhce' }, lookups).map((s) => s.id)).toEqual([1]);
    expect(filterSessions(sessions, { ...defaultSessionFilters, search: 'globex' }, lookups).map((s) => s.id)).toEqual([2]);
    expect(filterSessions(sessions, { ...defaultSessionFilters, search: 'jane' }, lookups).map((s) => s.id)).toEqual([1]);
  });

  it('combines multiple filters with AND semantics', () => {
    const sessions = [
      makeSession({ id: 1, sessionStatus: 'scheduled', locationType: 'onsite' }),
      makeSession({ id: 2, sessionStatus: 'scheduled', locationType: 'remote' }),
      makeSession({ id: 3, sessionStatus: 'completed', locationType: 'onsite' }),
    ];
    const result = filterSessions(sessions, { ...defaultSessionFilters, status: 'scheduled', location: 'onsite' }, lookups);
    expect(result.map((s) => s.id)).toEqual([1]);
  });

  it('returns an empty array when nothing matches', () => {
    const sessions = [makeSession({ id: 1 })];
    expect(filterSessions(sessions, { ...defaultSessionFilters, search: 'nonexistent' }, lookups)).toEqual([]);
  });
});

describe('hasActiveSessionFilters', () => {
  it('is false for the default filters', () => {
    expect(hasActiveSessionFilters(defaultSessionFilters)).toBe(false);
  });

  it('is true when search has non-whitespace text', () => {
    expect(hasActiveSessionFilters({ ...defaultSessionFilters, search: 'rhce' })).toBe(true);
  });

  it('is false when search is only whitespace', () => {
    expect(hasActiveSessionFilters({ ...defaultSessionFilters, search: '   ' })).toBe(false);
  });

  it('is true when any select filter is non-default', () => {
    expect(hasActiveSessionFilters({ ...defaultSessionFilters, status: 'completed' })).toBe(true);
    expect(hasActiveSessionFilters({ ...defaultSessionFilters, location: 'remote' })).toBe(true);
    expect(hasActiveSessionFilters({ ...defaultSessionFilters, instructorId: 1 })).toBe(true);
  });
});
