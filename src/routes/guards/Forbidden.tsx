import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { paths } from '../paths';
import styles from './Forbidden.module.css';

export function Forbidden() {
  const { t } = useTranslation('common');
  return (
    <div className={styles.wrapper}>
      <ShieldAlert size={40} className={styles.icon} />
      <h2>{t('Forbidden.title')}</h2>
      <p>{t('Forbidden.description')}</p>
      <Link to={paths.dashboard}>
        <Button variant="outline">{t('Forbidden.backToDashboard')}</Button>
      </Link>
    </div>
  );
}
