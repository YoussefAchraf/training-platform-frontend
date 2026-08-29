import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { paths } from './paths';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const { t } = useTranslation('common');
  return (
    <div className={styles.wrapper}>
      <Compass size={40} className={styles.icon} />
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>{t('NotFoundPage.message')}</p>
      <Link to={paths.home}>
        <Button variant="outline">{t('NotFoundPage.goHome')}</Button>
      </Link>
    </div>
  );
}
