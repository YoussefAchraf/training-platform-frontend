import { beforeEach, describe, expect, it } from 'vitest';
import type { AdminSessionOverview, Instructor, TrainingSession, User } from '@/shared/types/domain';
import { setRoleCatalog } from '@/shared/types/domain';
import {
  computeAdminInstructorUtilization,
  computeBookingTrend,
  computeInstructorUtilization,
  computeRoleBreakdown,
  computeStaffingCoverage,
  computeStatusCounts,
  computeWeeklyVolume,
  statusCountsTotal,
} from './dashboardMetrics';

function makeSession(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: 1,
    trainingId: 1,
    clientId: 1,
    instructorId: null,
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-01T17:00:00.000Z',
    sessionStatus: 'scheduled',
    assignmentStatus: 'unassigned',
    includeWeekends: false,
    locationType: 'onsite',
    createdBy: 1,
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeInstructor(overrides: Partial<Instructor> = {}): Instructor {
  return { id: 1, userId: 1, bio: null, firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com', skills: [], ...overrides };
}

function makeAdminSession(overrides: Partial<AdminSessionOverview> = {}): AdminSessionOverview {
  return {
    id: 1,
    trainingId: 1,
    trainingName: 'RHCE',
    clientId: 1,
    clientCompanyName: 'Acme',
    instructorId: null,
    instructorName: null,
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-01T17:00:00.000Z',
    sessionStatus: 'scheduled',
    assignmentStatus: 'unassigned',
    createdBy: 1,
    creatorName: 'Test Sales',
    creatorEmail: 'sales@example.com',
    attendeeCount: 0,
    attendeeSurveysSubmitted: 0,
    hasReport: false,
    ...overrides,
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return { id: 1, firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com', roleId: 1, status: 'approved', hasSeenTour: true, ...overrides };
}

describe('computeStatusCounts', () => {
  it('counts sessions per status, defaulting every status to 0', () => {
    const sessions = [
      makeSession({ id: 1, sessionStatus: 'scheduled' }),
      makeSession({ id: 2, sessionStatus: 'scheduled' }),
      makeSession({ id: 3, sessionStatus: 'completed' }),
      makeSession({ id: 4, sessionStatus: 'cancelled' }),
    ];
    expect(computeStatusCounts(sessions)).toEqual({ scheduled: 2, ongoing: 0, completed: 1, cancelled: 1 });
  });

  it('returns all zeros for an empty list', () => {
    expect(computeStatusCounts([])).toEqual({ scheduled: 0, ongoing: 0, completed: 0, cancelled: 0 });
  });
});

describe('statusCountsTotal', () => {
  it('sums every status', () => {
    expect(statusCountsTotal({ scheduled: 2, ongoing: 1, completed: 3, cancelled: 0 })).toBe(6);
  });
});

describe('computeWeeklyVolume', () => {
  it('returns weeksBack + weeksForward + 1 continuous points, including zero-session weeks', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const points = computeWeeklyVolume([], 4, 4, now);
    expect(points).toHaveLength(9);
    expect(points.every((p) => p.count === 0)).toBe(true);
  });

  it('buckets a session into the week its start date falls in, looking backward', () => {
    const now = new Date('2026-09-05T12:00:00.000Z'); 
    const sessions = [
      makeSession({ startDate: '2026-09-02T09:00:00.000Z' }), 
      makeSession({ startDate: '2026-09-02T15:00:00.000Z' }), 
      makeSession({ startDate: '2026-08-24T09:00:00.000Z' }), 
    ];
    const points = computeWeeklyVolume(sessions, 4, 4, now);
    const currentWeekPoint = points[4]; 
    const priorWeekPoint = points[3];
    expect(currentWeekPoint.count).toBe(2);
    expect(priorWeekPoint.count).toBe(1);
    expect(points.reduce((sum, p) => sum + p.count, 0)).toBe(3);
  });

  it('also buckets a session dated in the upcoming (forward) weeks - most bookings are future-dated', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const sessions = [makeSession({ startDate: '2026-09-23T09:00:00.000Z' })]; 
    const points = computeWeeklyVolume(sessions, 4, 4, now);
    expect(points.reduce((sum, p) => sum + p.count, 0)).toBe(1);
    expect(points[points.length - 1].count + points[points.length - 2].count).toBeGreaterThanOrEqual(1);
  });

  it('drops a session whose week falls outside the requested window instead of miscounting it', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const sessions = [makeSession({ startDate: '2026-01-01T09:00:00.000Z' })]; 
    const points = computeWeeklyVolume(sessions, 4, 4, now);
    expect(points.reduce((sum, p) => sum + p.count, 0)).toBe(0);
  });

  it('ignores sessions with an unparseable start date instead of throwing', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const sessions = [makeSession({ startDate: 'not-a-date' })];
    expect(() => computeWeeklyVolume(sessions, 4, 4, now)).not.toThrow();
    expect(computeWeeklyVolume(sessions, 4, 4, now).reduce((s, p) => s + p.count, 0)).toBe(0);
  });

  it('buckets by a custom date field when getDate is provided, instead of startDate', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const sessions = [
      
      makeSession({ startDate: '2027-01-01T09:00:00.000Z', createdAt: '2026-09-02T09:00:00.000Z' }),
    ];
    const byCreatedAt = computeWeeklyVolume(sessions, 4, 0, now, (session) => session.createdAt);
    expect(byCreatedAt.reduce((sum, p) => sum + p.count, 0)).toBe(1);
    expect(byCreatedAt[byCreatedAt.length - 1].count).toBe(1);
  });
});

describe('computeBookingTrend', () => {
  it('counts sessions created in the current and previous quarter, and computes the delta', () => {
    const now = new Date('2026-09-05T12:00:00.000Z'); 
    const sessions = [
      makeSession({ id: 1, createdAt: '2026-08-01T00:00:00.000Z' }), 
      makeSession({ id: 2, createdAt: '2026-07-15T00:00:00.000Z' }), 
      makeSession({ id: 3, createdAt: '2026-05-01T00:00:00.000Z' }), 
      makeSession({ id: 4, createdAt: '2025-01-01T00:00:00.000Z' }), 
    ];
    expect(computeBookingTrend(sessions, now)).toEqual({ currentQuarterCount: 2, previousQuarterCount: 1, deltaPct: 100 });
  });

  it('returns a null delta when there is no previous-quarter activity to compare against', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const sessions = [makeSession({ createdAt: '2026-08-01T00:00:00.000Z' })];
    expect(computeBookingTrend(sessions, now)).toEqual({ currentQuarterCount: 1, previousQuarterCount: 0, deltaPct: null });
  });

  it('returns all zeros and a null delta for an empty list', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    expect(computeBookingTrend([], now)).toEqual({ currentQuarterCount: 0, previousQuarterCount: 0, deltaPct: null });
  });

  it('ignores sessions with an unparseable createdAt instead of throwing', () => {
    const now = new Date('2026-09-05T12:00:00.000Z');
    const sessions = [makeSession({ createdAt: 'not-a-date' })];
    expect(() => computeBookingTrend(sessions, now)).not.toThrow();
    expect(computeBookingTrend(sessions, now)).toEqual({ currentQuarterCount: 0, previousQuarterCount: 0, deltaPct: null });
  });
});

describe('computeStaffingCoverage', () => {
  it('reports the share of sessions that are not sitting unassigned', () => {
    const sessions = [
      makeSession({ id: 1, assignmentStatus: 'unassigned' }),
      makeSession({ id: 2, assignmentStatus: 'accepted' }),
      makeSession({ id: 3, assignmentStatus: 'pending' }),
      makeSession({ id: 4, assignmentStatus: 'refused' }),
    ];
    expect(computeStaffingCoverage(sessions)).toEqual({ assigned: 3, total: 4, pct: 75 });
  });

  it('returns 0% for an empty list rather than dividing by zero', () => {
    expect(computeStaffingCoverage([])).toEqual({ assigned: 0, total: 0, pct: 0 });
  });

  it('returns 100% when every session has some assignment activity', () => {
    const sessions = [makeSession({ assignmentStatus: 'accepted' })];
    expect(computeStaffingCoverage(sessions).pct).toBe(100);
  });
});

describe('computeInstructorUtilization', () => {
  it('ranks instructors by assigned session count, descending', () => {
    const instructors = [makeInstructor({ id: 1, firstname: 'A' }), makeInstructor({ id: 2, firstname: 'B' }), makeInstructor({ id: 3, firstname: 'C' })];
    const sessions = [
      makeSession({ id: 1, instructorId: 2 }),
      makeSession({ id: 2, instructorId: 1 }),
      makeSession({ id: 3, instructorId: 1 }),
      makeSession({ id: 4, instructorId: 1 }),
    ];
    const result = computeInstructorUtilization(sessions, instructors);
    expect(result.map((r) => r.firstname)).toEqual(['A', 'B']);
    expect(result[0].count).toBe(3);
    expect(result[0].pct).toBe(100);
    expect(result[1].pct).toBe(Math.round((1 / 3) * 100));
  });

  it('excludes instructors with zero assigned sessions', () => {
    const instructors = [makeInstructor({ id: 1 }), makeInstructor({ id: 2 })];
    const sessions = [makeSession({ instructorId: 1 })];
    const result = computeInstructorUtilization(sessions, instructors);
    expect(result).toHaveLength(1);
    expect(result[0].instructorId).toBe(1);
  });

  it('ignores unassigned sessions (instructorId null)', () => {
    const instructors = [makeInstructor({ id: 1 })];
    const sessions = [makeSession({ instructorId: null }), makeSession({ instructorId: null })];
    expect(computeInstructorUtilization(sessions, instructors)).toEqual([]);
  });

  it('limits to the top N instructors', () => {
    const instructors = Array.from({ length: 8 }, (_, i) => makeInstructor({ id: i + 1 }));
    const sessions = instructors.map((instructor) => makeSession({ id: instructor.id, instructorId: instructor.id }));
    expect(computeInstructorUtilization(sessions, instructors, 5)).toHaveLength(5);
  });

  it('returns an empty array when there are no instructors', () => {
    expect(computeInstructorUtilization([makeSession({ instructorId: 1 })], [])).toEqual([]);
  });
});

describe('computeAdminInstructorUtilization', () => {
  it('ranks by assigned session count using the denormalized instructorName, descending', () => {
    const sessions = [
      makeAdminSession({ id: 1, instructorId: 2, instructorName: 'Bob Smith' }),
      makeAdminSession({ id: 2, instructorId: 1, instructorName: 'Ann Lee' }),
      makeAdminSession({ id: 3, instructorId: 1, instructorName: 'Ann Lee' }),
      makeAdminSession({ id: 4, instructorId: 1, instructorName: 'Ann Lee' }),
    ];
    const result = computeAdminInstructorUtilization(sessions);
    expect(result.map((r) => `${r.firstname} ${r.lastname}`)).toEqual(['Ann Lee', 'Bob Smith']);
    expect(result[0].count).toBe(3);
    expect(result[0].pct).toBe(100);
    expect(result[1].pct).toBe(Math.round((1 / 3) * 100));
  });

  it('ignores sessions with no instructor assigned', () => {
    const sessions = [makeAdminSession({ instructorId: null }), makeAdminSession({ instructorId: null })];
    expect(computeAdminInstructorUtilization(sessions)).toEqual([]);
  });

  it('limits to the top N instructors', () => {
    const sessions = Array.from({ length: 8 }, (_, i) => makeAdminSession({ id: i + 1, instructorId: i + 1, instructorName: `Instructor ${i}` }));
    expect(computeAdminInstructorUtilization(sessions, 5)).toHaveLength(5);
  });

  it('splits a single-word instructor name without crashing (empty lastname)', () => {
    const sessions = [makeAdminSession({ instructorId: 1, instructorName: 'Cher' })];
    const result = computeAdminInstructorUtilization(sessions);
    expect(result[0].firstname).toBe('Cher');
    expect(result[0].lastname).toBe('');
  });
});

describe('computeRoleBreakdown', () => {
  beforeEach(() => {
    setRoleCatalog([
      { id: 1, name: 'Manager' },
      { id: 2, name: 'Sales' },
      { id: 3, name: 'Instructor' },
      { id: 4, name: 'SuperAdmin' },
    ]);
  });

  it('buckets users by role and sorts descending by headcount', () => {
    const users = [
      makeUser({ id: 1, roleId: 3 }),
      makeUser({ id: 2, roleId: 3 }),
      makeUser({ id: 3, roleId: 3 }),
      makeUser({ id: 4, roleId: 2 }),
      makeUser({ id: 5, roleId: 2 }),
      makeUser({ id: 6, roleId: 4 }),
    ];
    expect(computeRoleBreakdown(users)).toEqual([
      { role: 'Instructor', count: 3 },
      { role: 'Sales', count: 2 },
      { role: 'SuperAdmin', count: 1 },
    ]);
  });

  it('returns an empty array for an empty user list', () => {
    expect(computeRoleBreakdown([])).toEqual([]);
  });

  it('skips a user whose roleId has no entry in the role catalog', () => {
    setRoleCatalog([]);
    expect(computeRoleBreakdown([makeUser({ roleId: 999 })])).toEqual([]);
  });
});
