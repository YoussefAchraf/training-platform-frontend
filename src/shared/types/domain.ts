

export type Role = 'Sales' | 'Manager' | 'Instructor' | 'SuperAdmin' | 'Developer';

export type TargetableRole = 'Sales' | 'Manager' | 'Instructor' | 'SuperAdmin';

export interface RoleCatalogEntry {
  id: number;
  name: Role;
}







const ROLE_BY_ID: Record<number, Role> = {};

export function setRoleCatalog(roles: RoleCatalogEntry[]): void {
  for (const key of Object.keys(ROLE_BY_ID)) delete ROLE_BY_ID[Number(key)];
  for (const role of roles) ROLE_BY_ID[role.id] = role.name;
}

export function roleNameOf(user: { roleId: number } | null | undefined): Role | undefined {
  return user ? ROLE_BY_ID[user.roleId] : undefined;
}

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'deactivated';

export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export type AssignmentStatus = 'unassigned' | 'pending' | 'accepted' | 'refused';

export type AttendanceStatus = 'pending' | 'present' | 'absent';

export type TrainingDurationUnit = 'days' | 'hours';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roleId: number;
  status: UserStatus;
  hasSeenTour: boolean;
}

export interface Provider {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  createdBy: number | null;
  creatorName: string | null;
  createdAt: string;
}

export interface Training {
  id: number;
  name: string;
  providerId: number;
  providerName: string;
  description: string | null;
  duration: number | null;
  durationUnit: TrainingDurationUnit | null;
  createdBy: number | null;
  creatorName: string | null;
  createdAt: string;
}

export interface Client {
  id: number;
  companyName: string;
  email: string | null;
  phone: string | null;
  createdBy: number | null;
  creatorName: string | null;
  createdAt: string;
}

export interface TrainingSession {
  id: number;
  trainingId: number;
  clientId: number;
  instructorId: number | null;
  startDate: string;
  endDate: string;
  sessionStatus: SessionStatus;
  assignmentStatus: AssignmentStatus;
  includeWeekends: boolean;
  createdBy: number | null;
  createdAt: string;
}

export interface SessionAttendee {
  id: number;
  sessionId: number;
  name: string;
  email: string | null;
  surveySubmitted: boolean;
  attendanceStatus: AttendanceStatus;
}

export interface BulkImportResult {
  importedCount: number;
  skippedCount: number;
  attendees: SessionAttendee[];
  skipped: Array<{ row: number; name: string | null; email: string | null; reason: string }>;
}

export interface InstructorSkill {
  trainingId: number;
  trainingName: string;
}

export interface Instructor {
  id: number;
  userId: number;
  bio: string | null;
  firstname: string;
  lastname: string;
  email: string;
  skills: InstructorSkill[];
}

export interface CalendarEvent {
  id: number;
  sessionId: number;
  eventDate: string;
  endDate: string | null;
  title: string;
  includeWeekends: boolean;
}

export interface SurveyQR {
  surveyUrl: string;
  qrCodeDataUrl: string;
}

export interface SurveyInfo {
  sessionId: number;
  trainingName: string | null;
  instructorName: string | null;
  startDate: string;
  endDate: string;
}

export interface Survey {
  id: number;
  sessionId: number;
  instructorId: number;
  attendeeId: number | null;
  instructorScore: number;
  npsScore: number;
  comments: string | null;
  submittedAt: string;
}

export interface Report {
  id: number;
  sessionId: number;
  pdfUrl: string | null;
  averageScore: string;
  npsAverage: string;
  generatedAt: string;
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'cancel'
  | 'approve'
  | 'reject'
  | 'password-reset-requested'
  | 'password-reset-completed'
  | 'change-password'
  | 'purge';

export type AuditEntityType = 'Provider' | 'Training' | 'Client' | 'Session' | 'User';

export interface AuditLogEntry {
  id: number;
  actorId: number | null;
  actorName: string | null;
  actorDeleted: boolean;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminSessionOverview {
  id: number;
  trainingId: number;
  trainingName: string;
  clientId: number;
  clientCompanyName: string;
  instructorId: number | null;
  instructorName: string | null;
  startDate: string;
  endDate: string;
  sessionStatus: SessionStatus;
  assignmentStatus: AssignmentStatus;
  createdBy: number | null;
  creatorName: string | null;
  creatorEmail: string | null;
  attendeeCount: number;
  attendeeSurveysSubmitted: number;
  hasReport: boolean;
}

export type FeedbackCategory = 'bug' | 'enhancement' | 'other';

export interface FeedbackReport {
  id: number;
  submittedBy: number;
  submitterName: string;
  submitterEmail: string;
  submitterRole: Role;
  category: FeedbackCategory;
  message: string;
  createdAt: string;
}

export interface FeatureAnnouncement {
  id: number;
  createdBy: number;
  title: string;
  description: string;
  targetRoles: TargetableRole[];
  createdAt: string;
}

export interface FeatureAnnouncementRoleRating {
  role: TargetableRole;
  averageStars: number;
  ratingCount: number;
}

export interface FeatureAnnouncementWithRatings extends FeatureAnnouncement {
  overallAverageStars: number | null;
  overallRatingCount: number;
  byRole: FeatureAnnouncementRoleRating[];
}

export interface ApiErrorBody {
  error: string;
}
