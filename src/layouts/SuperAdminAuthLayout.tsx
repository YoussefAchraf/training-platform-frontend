import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import styles from './SuperAdminAuthLayout.module.css';

export function SuperAdminAuthLayout() {
  const { t } = useTranslation('common');
  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>
        <ShieldAlert size={18} />
        <span>{t('SuperAdminAuthLayout.administratorAccess')}</span>
      </div>

      <main className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <PageTransition />
        </div>
      </main>

      <p className={styles.footnote}>
        {t('SuperAdminAuthLayout.footnote')}
      </p>
    </div>
  );
}
