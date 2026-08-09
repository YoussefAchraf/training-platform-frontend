import { GraduationCap } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import styles from './PublicLayout.module.css';

export function PublicLayout() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.brandMark}>
          <GraduationCap size={18} />
        </span>
        <span className={styles.brandName}>Training Platform</span>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <PageTransition />
        </div>
      </main>
    </div>
  );
}
