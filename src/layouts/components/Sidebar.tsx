import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';
import { usePrefetchRoute } from '@/routes/routeModules';
import { useIsSidebarCollapsed } from '@/shared/hooks/useMediaQuery';
import { IconRailNav } from '@/pwa/components/IconRailNav';
import { groupedNavItems } from './navItems';
import { UserMenu } from './UserMenu';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { t } = useTranslation('common');
  const { user, isSuperAdmin } = useAuth();
  const groups = groupedNavItems(user?.role);
  const prefetchRoute = usePrefetchRoute();
  const collapsed = useIsSidebarCollapsed();

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
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      )}

      <div className={styles.footer}>
        <UserMenu placement="up" variant={collapsed ? 'compact' : 'full'} />
      </div>
    </aside>
  );
}
