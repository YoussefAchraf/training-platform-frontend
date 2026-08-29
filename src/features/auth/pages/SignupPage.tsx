import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignupForm } from '../components/SignupForm';
import { paths } from '@/routes/paths';
import styles from './AuthPage.module.css';

export function SignupPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.heading}>
        <h2>{t('SignupPage.title')}</h2>
        <p>{t('SignupPage.description')}</p>
      </div>
      <SignupForm onSuccess={() => navigate(paths.pendingApproval)} />
    </div>
  );
}
