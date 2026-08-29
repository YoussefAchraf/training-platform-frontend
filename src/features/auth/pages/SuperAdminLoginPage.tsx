import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { SuperAdminLoginForm } from '../components/SuperAdminLoginForm';
import styles from './SuperAdminLoginPage.module.css';

export function SuperAdminLoginPage() {
  const { t } = useTranslation('auth');
  return (
    <div>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <ShieldAlert size={22} />
        </span>
        <h2>{t('SuperAdminLoginPage.title')}</h2>
        <p>{t('SuperAdminLoginPage.description')}</p>
      </div>
      <SuperAdminLoginForm />
    </div>
  );
}
