import type { AssignmentStatus, AttendanceStatus, AuditAction, Role, SessionStatus, UserStatus } from '@/shared/types/domain';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusMeta {
  label: string;
  tone: Tone;
  
  pulse?: boolean;
}

export const userStatusMeta: Record<UserStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  deactivated: { label: 'Deactivated', tone: 'neutral' },
};

export const sessionStatusMeta: Record<SessionStatus, StatusMeta> = {
  scheduled: { label: 'Scheduled', tone: 'info' },
  ongoing: { label: 'Ongoing', tone: 'danger', pulse: true },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const assignmentStatusMeta: Record<AssignmentStatus, StatusMeta> = {
  unassigned: { label: 'Unassigned', tone: 'neutral' },
  pending: { label: 'Pending response', tone: 'warning', pulse: true },
  accepted: { label: 'Accepted', tone: 'success' },
  refused: { label: 'Refused', tone: 'danger' },
};

export const attendanceStatusMeta: Record<AttendanceStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'warning' },
  present: { label: 'Present', tone: 'success' },
  absent: { label: 'Absent', tone: 'danger' },
};

export const roleMeta: Record<Role, StatusMeta> = {
  SuperAdmin: { label: 'SuperAdmin', tone: 'danger' },
  Manager: { label: 'Manager', tone: 'info' },
  Sales: { label: 'Sales', tone: 'neutral' },
  Instructor: { label: 'Instructor', tone: 'neutral' },
};

export const auditActionMeta: Record<AuditAction, StatusMeta> = {
  create: { label: 'Created', tone: 'success' },
  update: { label: 'Updated', tone: 'info' },
  delete: { label: 'Deleted', tone: 'danger' },
  cancel: { label: 'Cancelled', tone: 'danger' },
  approve: { label: 'Approved', tone: 'success' },
  reject: { label: 'Rejected', tone: 'danger' },
};


export function getAuditActionMeta(action: string): StatusMeta {
  return (auditActionMeta as Record<string, StatusMeta>)[action] ?? { label: action, tone: 'neutral' };
}
