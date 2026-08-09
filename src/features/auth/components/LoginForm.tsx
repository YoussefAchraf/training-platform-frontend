import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { paths } from '@/routes/paths';
import { useLogin } from '../hooks/useLogin';
import { establishSession } from '../establishSession';
import styles from './AuthForm.module.css';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  
  
  
  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: async (data) => {
        await establishSession(data.user);
        const redirectTo = (location.state as { from?: string } | null)?.from ?? paths.dashboard;
        navigate(redirectTo, { replace: true });
      },
    });
  });

  const errorMessage = login.isError
    ? getApiErrorMessage(login.error, 'Unable to sign in. Please try again.')
    : null;

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {errorMessage && (
        <div className={styles.formError} role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <FormField label="Email" error={errors.email?.message} required>
        {(fieldProps) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...fieldProps}
            {...register('email')}
          />
        )}
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        {(fieldProps) => (
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...fieldProps}
            {...register('password')}
          />
        )}
      </FormField>

      <Button type="submit" fullWidth isLoading={login.isPending}>
        Sign in
      </Button>

      <p className={styles.switchText}>
        Don&apos;t have an account? <Link to={paths.signup}>Create one</Link>
      </p>
    </form>
  );
}
