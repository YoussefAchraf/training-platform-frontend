import { ShieldAlert } from 'lucide-react';
import { SuperAdminLoginForm } from '../components/SuperAdminLoginForm';
import styles from './SuperAdminLoginPage.module.css';

export function SuperAdminLoginPage() {
  return (
    <div>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <ShieldAlert size={22} />
        </span>
        <h2>Administrator sign-in</h2>
        <p>This is a separate, restricted entry point for SuperAdmin accounts only.</p>
      </div>
      <SuperAdminLoginForm />
    </div>
  );
}
