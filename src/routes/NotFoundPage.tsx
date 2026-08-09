import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { paths } from './paths';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.wrapper}>
      <Compass size={40} className={styles.icon} />
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>This page doesn&apos;t exist.</p>
      <Link to={paths.home}>
        <Button variant="outline">Go home</Button>
      </Link>
    </div>
  );
}
