import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  const { t } = useTranslation('common');
  return (
    <div className={styles.wrapper}>
      <aside className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandMark}>
            <GraduationCap size={28} />
          </div>
          <h1 className={styles.brandTitle}>{t('Nav.brand')}</h1>
          <p className={styles.brandTagline}>
            {t('AuthLayout.brandTagline')}
          </p>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <div className={styles.mobileBrand}>
            <div className={styles.brandMarkSmall}>
              <GraduationCap size={20} />
            </div>
            <span>{t('Nav.brand')}</span>
          </div>
          <PageTransition />
        </div>
      </main>
    </div>
  );
}
