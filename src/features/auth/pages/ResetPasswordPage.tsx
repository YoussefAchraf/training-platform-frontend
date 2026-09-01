import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import styles from './AuthPage.module.css';

export function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div>
        <div className={styles.heading}>
          <h2>{t('ResetPasswordPage.invalidLinkTitle')}</h2>
          <p>{t('ResetPasswordPage.invalidLinkDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.heading}>
        <h2>{t('ResetPasswordPage.title')}</h2>
        <p>{t('ResetPasswordPage.description')}</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
