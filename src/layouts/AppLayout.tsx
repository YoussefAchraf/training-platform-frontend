import { PageTransition } from '@/shared/components/PageTransition';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { ChatWidget } from '@/features/chatbot/components/ChatWidget';
import { InstallBanner } from '@/pwa/components/InstallBanner';
import { IOSInstallBanner } from '@/pwa/components/IOSInstallBanner';
import { useIdlePrefetch } from '@/routes/useIdlePrefetch';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileDrawer } from './components/MobileDrawer';
import styles from './AppLayout.module.css';

export function AppLayout() {
  useIdlePrefetch();

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <MobileDrawer />
      <div className={styles.mainColumn}>
        <Topbar />
        <OfflineBanner />
        <main className={styles.main}>
          <div className={styles.content}>
            <PageTransition />
          </div>
        </main>
      </div>
      <ChatWidget />
      {}
      <InstallBanner />
      <IOSInstallBanner />
    </div>
  );
}
