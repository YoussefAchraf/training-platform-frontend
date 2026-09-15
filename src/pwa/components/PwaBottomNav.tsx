import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CalendarDays, Home, MessageCircle, MessagesSquare, User } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';
import { usePrefetchRoute } from '@/routes/routeModules';
import { primaryNavItems } from '@/layouts/components/navItems';
import { CHATBOT_WEBHOOK_URL } from '@/features/chatbot/api/chatbotClient';
import { useChatStore } from '@/features/chatbot/chatStore';
import { useCanUseMessaging } from '@/features/messaging/hooks/useConversations';
import { useUnreadMessagingCount } from '@/features/messaging/hooks/useUnreadMessagingCount';
import { useNavAttentionDots } from '@/shared/hooks/useNavAttentionDots';
import { NavBadgeCount } from '@/shared/components/NavBadgeCount';
import { paths } from '@/routes/paths';
import { houseSpring, bottomNavContainer, bottomNavItem } from '../motion/pwaVariants';
import styles from './PwaBottomNav.module.css';








const SPLASH_SESSION_KEY = 'pwa-splash-shown';

function shouldAnimateEntrance(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(SPLASH_SESSION_KEY) !== '1';
}

export function PwaBottomNav() {
  const { t } = useTranslation(['pwa', 'common']);
  const { user } = useAuth();
  const prefetchRoute = usePrefetchRoute();
  const hasUnreadChat = useChatStore((state) => state.hasUnread);
  const navAttentionDots = useNavAttentionDots();
  const canUseMessaging = useCanUseMessaging();
  const unreadMessagingCount = useUnreadMessagingCount();
  const [shouldAnimate] = useState(shouldAnimateEntrance);

  const roleThirdItem = primaryNavItems(user?.role)[2];
  
  
  
  
  const roleThirdLabel =
    roleThirdItem?.labelKey === 'common:Nav.items.myProfile' ? t('PwaBottomNav.skills') : roleThirdItem && t(roleThirdItem.labelKey);

  const tabs = [
    { to: paths.dashboard, label: t('PwaBottomNav.home'), icon: Home },
    { to: paths.calendar, label: t('PwaBottomNav.calendar'), icon: CalendarDays },
    roleThirdItem && { to: roleThirdItem.to, label: roleThirdLabel, icon: roleThirdItem.icon },
    canUseMessaging && { to: paths.messages, label: t('common:Nav.items.messages'), icon: MessagesSquare },
    CHATBOT_WEBHOOK_URL && { to: paths.chat, label: t('common:Nav.items.chat'), icon: MessageCircle },
    { to: paths.pwaProfile, label: t('PwaBottomNav.profile'), icon: User },
  ].filter((tab): tab is { to: string; label: string; icon: typeof Home } => Boolean(tab));

  return (
    <motion.nav
      className={styles.bar}
      aria-label={t('common:Nav.mainNavigation')}
      variants={bottomNavContainer}
      initial={shouldAnimate ? 'hidden' : 'show'}
      animate="show"
    >
      {tabs.map((tab) => (
        <motion.div key={tab.to} className={styles.tabMotionWrap} variants={bottomNavItem}>
          <NavLink
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
                  {tab.to === paths.messages ? (
                    <NavBadgeCount count={unreadMessagingCount} variant="corner" />
                  ) : (
                    ((tab.to === paths.chat && hasUnreadChat) || navAttentionDots[tab.to]) && (
                      <span className={styles.unreadDot} aria-hidden="true" />
                    )
                  )}
                </span>
                <span className={styles.label}>{tab.label}</span>
                {tab.to === paths.messages && unreadMessagingCount > 0 && (
                  <span className="visually-hidden">
                    , {t('common:Nav.unreadMessagesBadge', { count: unreadMessagingCount })}
                  </span>
                )}
                {navAttentionDots[tab.to] && <span className="visually-hidden">, {t('Nav.attentionBadge')}</span>}
              </>
            )}
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  );
}
