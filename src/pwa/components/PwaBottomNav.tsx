import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CalendarDays, Home, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';
import { usePrefetchRoute } from '@/routes/routeModules';
import { primaryNavItems } from '@/layouts/components/navItems';
import { CHATBOT_WEBHOOK_URL } from '@/features/chatbot/api/chatbotClient';
import { paths } from '@/routes/paths';
import { houseSpring } from '../motion/pwaVariants';
import styles from './PwaBottomNav.module.css';


export function PwaBottomNav() {
  const { t } = useTranslation(['pwa', 'common']);
  const { user } = useAuth();
  const prefetchRoute = usePrefetchRoute();

  const roleThirdItem = primaryNavItems(user?.role)[2];
  
  
  
  
  const roleThirdLabel =
    roleThirdItem?.labelKey === 'common:Nav.items.myProfile' ? t('PwaBottomNav.skills') : roleThirdItem && t(roleThirdItem.labelKey);

  const tabs = [
    { to: paths.dashboard, label: t('PwaBottomNav.home'), icon: Home },
    { to: paths.calendar, label: t('PwaBottomNav.calendar'), icon: CalendarDays },
    roleThirdItem && { to: roleThirdItem.to, label: roleThirdLabel, icon: roleThirdItem.icon },
    CHATBOT_WEBHOOK_URL && { to: paths.chat, label: t('common:Nav.items.chat'), icon: MessageCircle },
    { to: paths.pwaProfile, label: t('PwaBottomNav.profile'), icon: User },
  ].filter((tab): tab is { to: string; label: string; icon: typeof Home } => Boolean(tab));

  return (
    <nav className={styles.bar} aria-label={t('common:Nav.mainNavigation')}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          onTouchStart={() => prefetchRoute(tab.to)}
          className={({ isActive }) => cn(styles.tab, isActive && styles.tabActive)}
        >
          {({ isActive }) => (
            <>
              <span className={styles.iconWrap}>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active-pill"
                    className={styles.activePill}
                    transition={houseSpring}
                  />
                )}
                <tab.icon size={22} />
              </span>
              <span className={styles.label}>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
