import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePendingUsers } from '@/features/auth/hooks/usePendingUsers';
import { useNewAssignments } from '@/features/calendar/hooks/useNewAssignments';
import { cn } from '@/shared/utils/cn';
import { usePrefetchRoute } from '@/routes/routeModules';
import { useIsSidebarCollapsed } from '@/shared/hooks/useMediaQuery';
import { IconRailNav } from '@/pwa/components/IconRailNav';
import { TourButton } from '@/features/tour/TourButton';
import { paths } from '@/routes/paths';
import { groupedNavItems } from './navItems';
import { UserMenu } from './UserMenu';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { t } = useTranslation('common');
  const { user, isSuperAdmin, isManager, isInstructor } = useAuth();
  const groups = groupedNavItems(user?.role);
  const prefetchRoute = usePrefetchRoute();
  const collapsed = useIsSidebarCollapsed();

  
  
  
  
  
  
  
  const canSeePendingApprovals = isManager || isSuperAdmin;
  const pendingUsersQuery = usePendingUsers({ enabled: canSeePendingApprovals });
  
  
  
  const { newAssignments } = useNewAssignments({ enabled: isInstructor });

  const navBadgeCounts: Record<string, number> = {
    [paths.pendingApprovals]: canSeePendingApprovals ? (pendingUsersQuery.data?.length ?? 0) : 0,
    [paths.calendar]: newAssignments.length,
  };

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed, isSuperAdmin && styles.superAdmin)}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <GraduationCap size={20} />
        </span>
        <span className={cn(styles.brandName, collapsed && styles.hiddenLabel)}>{t('Nav.brand')}</span>
      </div>

      {collapsed ? (
        <IconRailNav role={user?.role} layoutId="sidebar-active-pill" className={styles.nav} />
      ) : (
        <nav className={styles.nav} aria-label={t('Nav.mainNavigation')}>
          {groups.map(({ group, items }) => (
            <div key={group ?? 'top'} className={styles.navGroup}>
              {group && <p className={styles.navCaption}>{t(`Nav.groups.${group}`)}</p>}
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onMouseEnter={() => prefetchRoute(item.to)}
                  onFocus={() => prefetchRoute(item.to)}
                  className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className={styles.activePill}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={styles.navContent}>
                        <item.icon size={19} />
                        <span>{t(item.labelKey)}</span>
                      </span>
                      {navBadgeCounts[item.to] > 0 && (
                        <span
                          className={styles.navBadge}
                          aria-label={t(
                            item.to === paths.pendingApprovals ? 'Nav.pendingApprovalsBadge' : 'Nav.newAssignmentsBadge',
                            { count: navBadgeCounts[item.to] },
                          )}
                        >
                          {navBadgeCounts[item.to]}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      )}

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <TourButton />
        </div>
        <UserMenu placement="up" variant={collapsed ? 'compact' : 'full'} align={collapsed ? 'left' : 'right'} />
      </div>
    </aside>
  );
}
