import { useTranslation } from 'react-i18next';
import { Code2 } from 'lucide-react';
import { DeveloperLoginForm } from '../components/DeveloperLoginForm';
import styles from './DeveloperLoginPage.module.css';

export function DeveloperLoginPage() {
  const { t } = useTranslation('auth');
  return (
    <div>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <Code2 size={22} />
        </span>
        <h2>{t('DeveloperLoginPage.title')}</h2>
        <p>{t('DeveloperLoginPage.description')}</p>
      </div>
      <DeveloperLoginForm />
    </div>
  );
}
