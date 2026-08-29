import { GraduationCap, MessageCircle } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { CHATBOT_WEBHOOK_URL } from '@/features/chatbot/api/chatbotClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useIdlePrefetch } from '@/routes/useIdlePrefetch';
import { UserMenu } from '@/layouts/components/UserMenu';
import { paths } from '@/routes/paths';
import type { NavItem } from '@/layouts/components/navItems';
import { PwaHeader } from '../components/PwaHeader';
import { IconRailNav } from '../components/IconRailNav';
import { SplashScreen } from '../components/SplashScreen';
import styles from './PwaTabletLayout.module.css';

const chatExtraItem: NavItem = { labelKey: 'common:Nav.items.chat', to: paths.chat, icon: MessageCircle };








export function PwaTabletLayout() {
  useIdlePrefetch();
  const { user } = useAuth();

  return (
    <div className={styles.wrapper}>
      <SplashScreen />
      <aside className={styles.rail}>
        <span className={styles.brandMark}>
          <GraduationCap size={20} />
        </span>
        <IconRailNav
          role={user?.role}
          layoutId="pwa-tablet-active-pill"
          className={styles.nav}
          extraItems={CHATBOT_WEBHOOK_URL ? [chatExtraItem] : undefined}
        />
        <div className={styles.railFooter}>
          <UserMenu placement="up" variant="compact" align="left" />
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <PwaHeader />
        <OfflineBanner />
        <main className={styles.main}>
          <div className={styles.content}>
            <PageTransition />
          </div>
        </main>
      </div>
    </div>
  );
}
