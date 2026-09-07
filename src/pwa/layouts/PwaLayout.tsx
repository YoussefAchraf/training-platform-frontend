import { PageTransition } from '@/shared/components/PageTransition';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { MobileDrawer } from '@/layouts/components/MobileDrawer';
import { useIdlePrefetch } from '@/routes/useIdlePrefetch';
import { PwaHeader } from '../components/PwaHeader';
import { PwaBottomNav } from '../components/PwaBottomNav';
import { SplashScreen } from '../components/SplashScreen';
import styles from './PwaLayout.module.css';













export function PwaLayout() {
  useIdlePrefetch();

  return (
    <div className={styles.wrapper}>
      <SplashScreen />
      <PwaHeader showMenuToggle />
      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.content}>
          <PageTransition />
        </div>
      </main>
      <PwaBottomNav />
      <MobileDrawer roleInsteadOfBrand />
    </div>
  );
}
