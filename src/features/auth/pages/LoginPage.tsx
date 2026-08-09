import { LoginForm } from '../components/LoginForm';
import styles from './AuthPage.module.css';

export function LoginPage() {
  return (
    <div>
      <div className={styles.heading}>
        <h2>Welcome back</h2>
        <p>Sign in to manage providers, trainings, and sessions.</p>
      </div>
      <LoginForm />
    </div>
  );
}
