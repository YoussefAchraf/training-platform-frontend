import type {
  AssignmentStatus,
  AttendanceStatus,
  AuditAction,
  FeedbackCategory,
  Role,
  SessionStatus,
  UserStatus,
} from '@/shared/types/domain';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusMeta {
  labelKey: string;
  tone: Tone;

  pulse?: boolean;
}

export const userStatusMeta: Record<UserStatus, StatusMeta> = {
  pending: { labelKey: 'common:Status.userPending', tone: 'warning' },
  approved: { labelKey: 'common:Status.userApproved', tone: 'success' },
  rejected: { labelKey: 'common:Status.userRejected', tone: 'danger' },
  deactivated: { labelKey: 'common:Status.userDeactivated', tone: 'neutral' },
};

export const sessionStatusMeta: Record<SessionStatus, StatusMeta> = {
  scheduled: { labelKey: 'common:Status.sessionScheduled', tone: 'info' },
  ongoing: { labelKey: 'common:Status.sessionOngoing', tone: 'danger', pulse: true },
  completed: { labelKey: 'common:Status.sessionCompleted', tone: 'success' },
  cancelled: { labelKey: 'common:Status.sessionCancelled', tone: 'neutral' },
};

export const assignmentStatusMeta: Record<AssignmentStatus, StatusMeta> = {
  unassigned: { labelKey: 'common:Status.assignmentUnassigned', tone: 'neutral' },
  pending: { labelKey: 'common:Status.assignmentPending', tone: 'warning', pulse: true },
  accepted: { labelKey: 'common:Status.assignmentAccepted', tone: 'success' },
  refused: { labelKey: 'common:Status.assignmentRefused', tone: 'danger' },
};

export const attendanceStatusMeta: Record<AttendanceStatus, StatusMeta> = {
  pending: { labelKey: 'common:Status.attendancePending', tone: 'warning' },
  present: { labelKey: 'common:Status.attendancePresent', tone: 'success' },
  absent: { labelKey: 'common:Status.attendanceAbsent', tone: 'danger' },
};

export const roleMeta: Record<Role, StatusMeta> = {
  SuperAdmin: { labelKey: 'common:Status.roleSuperAdmin', tone: 'danger' },
  Manager: { labelKey: 'common:Status.roleManager', tone: 'info' },
  Sales: { labelKey: 'common:Status.roleSales', tone: 'neutral' },
  Instructor: { labelKey: 'common:Status.roleInstructor', tone: 'neutral' },
  Developer: { labelKey: 'common:Status.roleDeveloper', tone: 'info' },
};

export const feedbackCategoryMeta: Record<FeedbackCategory, StatusMeta> = {
  bug: { labelKey: 'feedback:FeedbackCategories.bug', tone: 'danger' },
  enhancement: { labelKey: 'feedback:FeedbackCategories.enhancement', tone: 'info' },
  other: { labelKey: 'feedback:FeedbackCategories.other', tone: 'neutral' },
};

export const auditActionMeta: Record<AuditAction, StatusMeta> = {
  create: { labelKey: 'common:Status.auditCreate', tone: 'success' },
  update: { labelKey: 'common:Status.auditUpdate', tone: 'info' },
  delete: { labelKey: 'common:Status.auditDelete', tone: 'danger' },
  cancel: { labelKey: 'common:Status.auditCancel', tone: 'danger' },
  approve: { labelKey: 'common:Status.auditApprove', tone: 'success' },
  reject: { labelKey: 'common:Status.auditReject', tone: 'danger' },
  'password-reset-requested': { labelKey: 'common:Status.auditPasswordResetRequested', tone: 'warning' },
  'password-reset-completed': { labelKey: 'common:Status.auditPasswordResetCompleted', tone: 'success' },
  'change-password': { labelKey: 'common:Status.auditChangePassword', tone: 'success' },
};

export function getAuditActionMeta(action: string): StatusMeta {
  return (auditActionMeta as Record<string, StatusMeta>)[action] ?? { labelKey: action, tone: 'neutral' };
}
