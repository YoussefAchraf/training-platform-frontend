import { paths } from '@/routes/paths';

export function navBadgeLabelKey(path: string): 'Nav.pendingApprovalsBadge' | 'Nav.newAssignmentsBadge' | 'Nav.unreadMessagesBadge' {
  if (path === paths.pendingApprovals) return 'Nav.pendingApprovalsBadge';
  if (path === paths.messages) return 'Nav.unreadMessagesBadge';
  return 'Nav.newAssignmentsBadge';
}
