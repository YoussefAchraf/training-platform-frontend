import { useTranslation } from 'react-i18next';
import { Code2 } from 'lucide-react';
import { PageTransition } from '@/shared/components/PageTransition';
import styles from './DeveloperAuthLayout.module.css';

export function DeveloperAuthLayout() {
  const { t } = useTranslation('common');
  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>
        <Code2 size={18} />
        <span>{t('DeveloperAuthLayout.developerAccess')}</span>
      </div>

      <main className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <PageTransition />
        </div>
      </main>

      <p className={styles.footnote}>{t('DeveloperAuthLayout.footnote')}</p>
    </div>
  );
}
