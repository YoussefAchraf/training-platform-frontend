import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, MessageCircle, Search } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { CHATBOT_WEBHOOK_URL } from '@/features/chatbot/api/chatbotClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useIdlePrefetch } from '@/routes/useIdlePrefetch';
import { usePrefetchRoute } from '@/routes/routeModules';
import { useUiStore } from '@/shared/store/uiStore';
import { cn } from '@/shared/utils/cn';
import { UserMenu } from '@/layouts/components/UserMenu';
import { groupedNavItems } from '@/layouts/components/navItems';
import { paths } from '@/routes/paths';
import { CommandPalette } from '../components/CommandPalette';
import { SplashScreen } from '../components/SplashScreen';
import styles from './PwaDesktopLayout.module.css';


export function PwaDesktopLayout() {
  useIdlePrefetch();
  const { user } = useAuth();
  const location = useLocation();
  const isChatRoute = location.pathname === paths.chat;
  const prefetchRoute = usePrefetchRoute();
  const openPalette = useUiStore((state) => state.openCommandPalette);
  const groups = groupedNavItems(user?.role);
  const allGroups = CHATBOT_WEBHOOK_URL
    ? [...groups, { group: null, items: [{ label: 'Chat', to: paths.chat, icon: MessageCircle }] }]
    : groups;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent);

  return (
    <div className={styles.wrapper}>
      <SplashScreen />
      <CommandPalette />

      <header className={styles.titleBar}>
        <span className={styles.titleBrand}>
          <GraduationCap size={16} />
          Training Platform
        </span>
        <button type="button" className={styles.paletteHint} onClick={openPalette}>
          <Search size={14} />
          <span>Search or jump to...</span>
          <kbd className={styles.kbd}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <div className={styles.userMenuSlot}>
          <UserMenu placement="down" variant="compact" />
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav} aria-label="Main navigation">
            {allGroups.map(({ group, items }, groupIndex) => (
              <div key={group ?? `top-${groupIndex}`} className={styles.navGroup}>
                {group && <p className={styles.navCaption}>{group}</p>}
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onMouseEnter={() => prefetchRoute(item.to)}
                    onFocus={() => prefetchRoute(item.to)}
                    className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
                  >
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className={styles.mainColumn}>
          <OfflineBanner />
          <main className={styles.main}>
            {/* Chat drops the content column's max-width/padding so it fills
                the pane edge-to-edge (still inside the title bar/sidebar
                chrome, unlike the phone shell's full-viewport takeover -
                desktop keeps navigation reachable). */}
            <div className={cn(styles.content, isChatRoute && styles.contentFullBleed)}>
              <PageTransition />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
