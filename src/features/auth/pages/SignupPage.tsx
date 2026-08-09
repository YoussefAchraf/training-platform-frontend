import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/SignupForm';
import { paths } from '@/routes/paths';
import styles from './AuthPage.module.css';

export function SignupPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.heading}>
        <h2>Create your account</h2>
        <p>Sign up as Sales, Manager, or Instructor. A Manager reviews every new account.</p>
      </div>
      <SignupForm onSuccess={() => navigate(paths.pendingApproval)} />
    </div>
  );
}
