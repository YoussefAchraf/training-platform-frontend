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
  labelKey: string;
  to: string;
  icon: ComponentType<{ size?: number }>;
  roles?: Role[];
  
  primary?: boolean;
  
  group?: 'Catalog' | 'People' | 'Administration';
}

export const navItems: NavItem[] = [
  { labelKey: 'common:Nav.items.dashboard', to: paths.dashboard, icon: LayoutDashboard, primary: true },
  { labelKey: 'common:Nav.items.calendar', to: paths.calendar, icon: CalendarDays, primary: true },
  { labelKey: 'common:Nav.items.providers', to: paths.providers, icon: Building2, group: 'Catalog' },
  { labelKey: 'common:Nav.items.trainings', to: paths.trainings, icon: GraduationCap, group: 'Catalog' },
  { labelKey: 'common:Nav.items.clients', to: paths.clients, icon: Users, group: 'Catalog' },
  {
    labelKey: 'common:Nav.items.sessions',
    to: paths.sessions,
    icon: CalendarClock,
    roles: ['Sales', 'Manager', 'SuperAdmin'],
    primary: true,
    group: 'Catalog',
  },
  {
    labelKey: 'common:Nav.items.instructors',
    to: paths.instructors,
    icon: UserCog,
    roles: ['Sales', 'Manager', 'SuperAdmin'],
    group: 'People',
  },
  { labelKey: 'common:Nav.items.myProfile', to: paths.myInstructorProfile, icon: UserCog, roles: ['Instructor'], primary: true },
  {
    labelKey: 'common:Nav.items.pendingApprovals',
    to: paths.pendingApprovals,
    icon: ClipboardCheck,
    roles: ['Manager', 'SuperAdmin'],
    group: 'People',
  },
  { labelKey: 'common:Nav.items.users', to: paths.superAdminUsers, icon: Users2, roles: ['SuperAdmin'], group: 'Administration' },
  {
    labelKey: 'common:Nav.items.sessionsOverview',
    to: paths.superAdminSessions,
    icon: CalendarClock,
    roles: ['SuperAdmin'],
    group: 'Administration',
  },
  {
    labelKey: 'common:Nav.items.auditLog',
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
