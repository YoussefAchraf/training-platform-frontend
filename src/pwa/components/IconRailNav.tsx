import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import { usePrefetchRoute } from '@/routes/routeModules';
import { usePendingUsers } from '@/features/auth/hooks/usePendingUsers';
import { useNewAssignments } from '@/features/calendar/hooks/useNewAssignments';
import { useUnreadMessagingCount } from '@/features/messaging/hooks/useUnreadMessagingCount';
import { useNavAttentionDots } from '@/shared/hooks/useNavAttentionDots';
import { AttentionDot } from '@/shared/components/AttentionDot';
import { groupedNavItems } from '@/layouts/components/navItems';
import { navBadgeLabelKey } from '@/layouts/components/navBadgeLabelKey';
import type { NavItem } from '@/layouts/components/navItems';
import { paths } from '@/routes/paths';
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

  
  
  
  
  
  
  const canSeePendingApprovals = role === 'Manager' || role === 'SuperAdmin';
  const pendingUsersQuery = usePendingUsers({ enabled: canSeePendingApprovals });
  const { newAssignments } = useNewAssignments({ enabled: role === 'Instructor' });
  const unreadMessagingCount = useUnreadMessagingCount();

  const navBadgeCounts: Record<string, number> = {
    [paths.pendingApprovals]: canSeePendingApprovals ? (pendingUsersQuery.data?.length ?? 0) : 0,
    [paths.calendar]: newAssignments.length,
    [paths.messages]: unreadMessagingCount,
  };
  const navAttentionDots = useNavAttentionDots();

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
                    {navBadgeCounts[item.to] > 0 && (
                      <span className={styles.railBadge} aria-hidden="true">
                        {navBadgeCounts[item.to] > 9 ? '9+' : navBadgeCounts[item.to]}
                      </span>
                    )}
                    {navAttentionDots[item.to] && <AttentionDot className={styles.railDot} />}
                  </span>
                  <span className={styles.srLabel}>
                    {t(item.labelKey)}
                    {navBadgeCounts[item.to] > 0 &&
                      `, ${t(navBadgeLabelKey(item.to), { count: navBadgeCounts[item.to] })}`}
                    {navAttentionDots[item.to] && `, ${t('Nav.attentionBadge')}`}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
