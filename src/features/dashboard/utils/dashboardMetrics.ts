import { addWeeks, endOfQuarter, format, isWithinInterval, startOfQuarter, startOfWeek, subQuarters, subWeeks } from 'date-fns';
import type { AdminSessionOverview, Instructor, Role, SessionStatus, TrainingSession, User } from '@/shared/types/domain';
import { roleNameOf } from '@/shared/types/domain';









const SESSION_STATUSES: SessionStatus[] = ['scheduled', 'ongoing', 'completed', 'cancelled'];

export function computeStatusCounts<T extends { sessionStatus: SessionStatus }>(sessions: T[]): Record<SessionStatus, number> {
  const counts: Record<SessionStatus, number> = { scheduled: 0, ongoing: 0, completed: 0, cancelled: 0 };
  for (const session of sessions) {
    counts[session.sessionStatus] += 1;
  }
  return counts;
}

export function statusCountsTotal(counts: Record<SessionStatus, number>): number {
  return SESSION_STATUSES.reduce((sum, status) => sum + counts[status], 0);
}

export interface WeeklyVolumePoint {
  weekStart: string;
  label: string;
  count: number;
}








export function computeWeeklyVolume<T extends { startDate: string }>(
  sessions: T[],
  weeksBack = 4,
  weeksForward = 4,
  now: Date = new Date(),
  getDate: (session: T) => string = (session) => session.startDate,
): WeeklyVolumePoint[] {
  const buckets = new Map<string, number>();
  const points: WeeklyVolumePoint[] = [];

  for (let i = -weeksBack; i <= weeksForward; i += 1) {
    const weekStart = i < 0 ? startOfWeek(subWeeks(now, -i), { weekStartsOn: 1 }) : startOfWeek(addWeeks(now, i), { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');
    buckets.set(key, 0);
    points.push({ weekStart: key, label: format(weekStart, 'MMM d'), count: 0 });
  }

  for (const session of sessions) {
    const start = new Date(getDate(session));
    if (Number.isNaN(start.getTime())) continue;
    const weekStart = startOfWeek(start, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');
    if (!buckets.has(key)) continue;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return points.map((point) => ({ ...point, count: buckets.get(point.weekStart) ?? 0 }));
}

export interface BookingTrend {
  currentQuarterCount: number;
  previousQuarterCount: number;
  
  deltaPct: number | null;
}





export function computeBookingTrend(sessions: TrainingSession[], now: Date = new Date()): BookingTrend {
  const currentStart = startOfQuarter(now);
  const currentEnd = endOfQuarter(now);
  const previousQuarterAnchor = subQuarters(now, 1);
  const previousStart = startOfQuarter(previousQuarterAnchor);
  const previousEnd = endOfQuarter(previousQuarterAnchor);

  let currentQuarterCount = 0;
  let previousQuarterCount = 0;
  for (const session of sessions) {
    const created = new Date(session.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    if (isWithinInterval(created, { start: currentStart, end: currentEnd })) {
      currentQuarterCount += 1;
    } else if (isWithinInterval(created, { start: previousStart, end: previousEnd })) {
      previousQuarterCount += 1;
    }
  }

  const deltaPct =
    previousQuarterCount > 0 ? Math.round(((currentQuarterCount - previousQuarterCount) / previousQuarterCount) * 100) : null;

  return { currentQuarterCount, previousQuarterCount, deltaPct };
}

export interface StaffingCoverage {
  assigned: number;
  total: number;
  pct: number;
}




export function computeStaffingCoverage(sessions: TrainingSession[]): StaffingCoverage {
  const total = sessions.length;
  const assigned = sessions.filter((session) => session.assignmentStatus !== 'unassigned').length;
  return { assigned, total, pct: total > 0 ? Math.round((assigned / total) * 100) : 0 };
}

export interface InstructorUtilization {
  instructorId: number;
  firstname: string;
  lastname: string;
  count: number;
  pct: number;
}





export function computeInstructorUtilization(
  sessions: TrainingSession[],
  instructors: Instructor[],
  limit = 5,
): InstructorUtilization[] {
  const countByInstructor = new Map<number, number>();
  for (const session of sessions) {
    if (session.instructorId == null) continue;
    countByInstructor.set(session.instructorId, (countByInstructor.get(session.instructorId) ?? 0) + 1);
  }

  const ranked = instructors
    .map((instructor) => ({ instructor, count: countByInstructor.get(instructor.id) ?? 0 }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const max = ranked[0]?.count ?? 0;
  return ranked.map(({ instructor, count }) => ({
    instructorId: instructor.id,
    firstname: instructor.firstname,
    lastname: instructor.lastname,
    count,
    pct: max > 0 ? Math.round((count / max) * 100) : 0,
  }));
}





export function computeAdminInstructorUtilization(sessions: AdminSessionOverview[], limit = 5): InstructorUtilization[] {
  const countByInstructor = new Map<number, { name: string; count: number }>();
  for (const session of sessions) {
    if (session.instructorId == null) continue;
    const existing = countByInstructor.get(session.instructorId);
    if (existing) {
      existing.count += 1;
    } else {
      countByInstructor.set(session.instructorId, { name: session.instructorName ?? '', count: 1 });
    }
  }

  const ranked = Array.from(countByInstructor.entries())
    .map(([instructorId, entry]) => ({ instructorId, ...entry }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const max = ranked[0]?.count ?? 0;
  return ranked.map(({ instructorId, name, count }) => {
    const [firstname, ...rest] = name.split(' ');
    return {
      instructorId,
      firstname: firstname ?? '',
      lastname: rest.join(' '),
      count,
      pct: max > 0 ? Math.round((count / max) * 100) : 0,
    };
  });
}

export interface RoleBreakdownEntry {
  role: Role;
  count: number;
}




export function computeRoleBreakdown(users: User[]): RoleBreakdownEntry[] {
  const counts = new Map<Role, number>();
  for (const user of users) {
    const role = roleNameOf(user);
    if (!role) continue;
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);
}
