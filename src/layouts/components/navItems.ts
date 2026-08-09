import type { ComponentType } from 'react';
import {
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  UserCog,
  Users,
  Users2,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import type { Role } from '@/shared/types/domain';

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ size?: number }>;
  roles?: Role[];
  
  primary?: boolean;
  
  group?: 'Catalog' | 'People' | 'Administration';
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, primary: true },
  { label: 'Calendar', to: paths.calendar, icon: CalendarDays, primary: true },
  { label: 'Providers', to: paths.providers, icon: Building2, group: 'Catalog' },
  { label: 'Trainings', to: paths.trainings, icon: GraduationCap, group: 'Catalog' },
  { label: 'Clients', to: paths.clients, icon: Users, group: 'Catalog' },
  {
    label: 'Sessions',
    to: paths.sessions,
    icon: CalendarClock,
    roles: ['Sales', 'Manager', 'SuperAdmin'],
    primary: true,
    group: 'Catalog',
  },
  {
    label: 'Instructors',
    to: paths.instructors,
    icon: UserCog,
    roles: ['Sales', 'Manager', 'SuperAdmin'],
    group: 'People',
  },
  { label: 'My Profile', to: paths.myInstructorProfile, icon: UserCog, roles: ['Instructor'], primary: true },
  {
    label: 'Pending Approvals',
    to: paths.pendingApprovals,
    icon: ClipboardCheck,
    roles: ['Manager', 'SuperAdmin'],
    group: 'People',
  },
  { label: 'Users', to: paths.superAdminUsers, icon: Users2, roles: ['SuperAdmin'], group: 'Administration' },
  {
    label: 'Sessions Overview',
    to: paths.superAdminSessions,
    icon: CalendarClock,
    roles: ['SuperAdmin'],
    group: 'Administration',
  },
  {
    label: 'Audit Log',
    to: paths.auditLog,
    icon: History,
    roles: ['Manager', 'SuperAdmin'],
    group: 'Administration',
  },
];

export function visibleNavItems(role: Role | undefined): NavItem[] {
  return navItems.filter((item) => !item.roles || (role && item.roles.includes(role)));
}

export function primaryNavItems(role: Role | undefined): NavItem[] {
  return visibleNavItems(role).filter((item) => item.primary);
}

export function overflowNavItems(role: Role | undefined): NavItem[] {
  return visibleNavItems(role).filter((item) => !item.primary);
}

const GROUP_ORDER = ['Catalog', 'People', 'Administration'] as const;


export function groupedNavItems(role: Role | undefined): Array<{ group: string | null; items: NavItem[] }> {
  const items = visibleNavItems(role);
  const ungrouped = items.filter((item) => !item.group);
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  })).filter((entry) => entry.items.length > 0);

  return [{ group: null, items: ungrouped }, ...groups];
}
