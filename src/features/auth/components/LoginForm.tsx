import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AlertCircle } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { paths } from '@/routes/paths';
import { useLogin } from '../hooks/useLogin';
import { establishSession } from '../establishSession';
import styles from './AuthForm.module.css';

function buildLoginSchema(t: TFunction<'auth'>) {
  return z.object({
    email: z.email(t('LoginForm.errors.emailInvalid')),
    password: z.string().min(1, t('LoginForm.errors.passwordRequired')),
  });
}

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

export function LoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const login = useLogin();
  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: async (data) => {
        await establishSession(data.user);
        navigate(paths.dashboard, { replace: true });
      },
    });
  });

  const errorMessage = login.isError
    ? getApiErrorMessage(login.error, t('LoginForm.genericError'))
    : null;

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {errorMessage && (
        <div className={styles.formError} role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <FormField label={t('LoginForm.emailLabel')} error={errors.email?.message} required>
        {(fieldProps) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder={t('LoginForm.emailPlaceholder')}
            {...fieldProps}
            {...register('email')}
          />
        )}
      </FormField>

      <FormField label={t('LoginForm.passwordLabel')} error={errors.password?.message} required>
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
        {t('LoginForm.signIn')}
      </Button>

      <p className={styles.switchText}>
        {t('LoginForm.noAccount')} <Link to={paths.signup}>{t('LoginForm.createOne')}</Link>
      </p>
    </form>
  );
}
