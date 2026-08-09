import { Link } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import styles from './AuthPage.module.css';

export function PendingApprovalPage() {
  return (
    <div className={styles.centered}>
      <div className={cn(styles.iconWrap, styles.warning)}>
        <Clock3 size={28} />
      </div>
      <h2>Awaiting approval</h2>
      <p className={styles.description}>
        Your account request has been sent to a Manager for review. You&apos;ll be able to sign
        in as soon as it&apos;s approved.
      </p>
      <Link to={paths.login}>
        <Button variant="outline">Back to sign in</Button>
      </Link>
    </div>
  );
}
