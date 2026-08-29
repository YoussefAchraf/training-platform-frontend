import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import { usePrefetchRoute } from '@/routes/routeModules';
import { groupedNavItems } from '@/layouts/components/navItems';
import type { NavItem } from '@/layouts/components/navItems';
import type { Role } from '@/shared/types/domain';
import styles from './IconRailNav.module.css';

interface IconRailNavProps {
  role: Role | undefined;
  layoutId: string;
  className?: string;
  
  extraItems?: NavItem[];
}


export function IconRailNav({ role, layoutId, className, extraItems }: IconRailNavProps) {
  const { t } = useTranslation('common');
  const groups = groupedNavItems(role);
  const prefetchRoute = usePrefetchRoute();

  const allGroups =
    extraItems && extraItems.length > 0 ? [...groups, { group: null, items: extraItems }] : groups;

  return (
    <nav className={cn(styles.rail, className)} aria-label={t('Nav.mainNavigation')}>
      {allGroups.map(({ group, items }, groupIndex) => (
        <div key={group ?? `top-${groupIndex}`} className={styles.group}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={t(item.labelKey)}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={({ isActive }) => cn(styles.link, isActive && styles.linkActive)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={layoutId}
                      className={styles.activePill}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={styles.iconWrap}>
                    <item.icon size={19} />
                  </span>
                  <span className={styles.srLabel}>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
