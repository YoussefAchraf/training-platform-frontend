import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock3 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import styles from './AuthPage.module.css';

export function PendingApprovalPage() {
  const { t } = useTranslation('auth');
  return (
    <div className={styles.centered}>
      <div className={cn(styles.iconWrap, styles.warning)}>
        <Clock3 size={28} />
      </div>
      <h2>{t('PendingApprovalPage.title')}</h2>
      <p className={styles.description}>{t('PendingApprovalPage.description')}</p>
      <Link to={paths.login}>
        <Button variant="outline">{t('PendingApprovalPage.backToSignIn')}</Button>
      </Link>
    </div>
  );
}
