import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const { t } = useTranslation('auth');
  return (
    <div>
      <div className={styles.heading}>
        <h2>{t('LoginPage.title')}</h2>
        <p>{t('LoginPage.description')}</p>
      </div>
      <LoginForm />
    </div>
  );
}
