import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { paths } from '../paths';
import styles from './Forbidden.module.css';

export function Forbidden() {
  return (
    <div className={styles.wrapper}>
      <ShieldAlert size={40} className={styles.icon} />
      <h2>You don&apos;t have access to this page</h2>
      <p>Your current role doesn&apos;t include permission to view this section.</p>
      <Link to={paths.dashboard}>
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}
