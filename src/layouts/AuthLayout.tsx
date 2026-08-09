import { GraduationCap } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandMark}>
            <GraduationCap size={28} />
          </div>
          <h1 className={styles.brandTitle}>Training Platform</h1>
          <p className={styles.brandTagline}>
            Plan providers and trainings, book sessions for clients, assign instructors, and
            track feedback - all in one place.
          </p>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <div className={styles.mobileBrand}>
            <div className={styles.brandMarkSmall}>
              <GraduationCap size={20} />
            </div>
            <span>Training Platform</span>
          </div>
          <PageTransition />
        </div>
      </main>
    </div>
  );
}
