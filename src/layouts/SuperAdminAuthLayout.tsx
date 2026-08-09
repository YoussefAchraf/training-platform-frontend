import { ShieldAlert } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import styles from './SuperAdminAuthLayout.module.css';

export function SuperAdminAuthLayout() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>
        <ShieldAlert size={18} />
        <span>Administrator access</span>
      </div>

      <main className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <PageTransition />
        </div>
      </main>

      <p className={styles.footnote}>
        Restricted area. Access attempts may be logged and monitored.
      </p>
    </div>
  );
}
