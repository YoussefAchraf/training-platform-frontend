import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { paths } from '@/routes/paths';
import { useResetPassword } from '../hooks/useResetPassword';
import { newPasswordRule } from '../passwordSchema';
import styles from './AuthForm.module.css';

function buildResetPasswordSchema(t: TFunction<'auth'>) {
  return z
    .object({
      newPassword: newPasswordRule(t),
      confirmPassword: z.string().min(1, t('ResetPasswordForm.errors.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('ResetPasswordForm.errors.passwordsMismatch'),
      path: ['confirmPassword'],
    });
}

type ResetPasswordFormValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const schema = useMemo(() => buildResetPasswordSchema(t), [t]);
  const [isDone, setIsDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    resetPassword.mutate(
      { token, newPassword: values.newPassword },
      { onSuccess: () => setIsDone(true) },
    );
  });

  if (isDone) {
    return (
      <div className={styles.form}>
        <div className={styles.successBanner} role="status">
          <CheckCircle2 size={16} />
          <span>{t('ResetPasswordForm.success')}</span>
        </div>
        <Button type="button" fullWidth onClick={() => navigate(paths.login, { replace: true })}>
          {t('ResetPasswordForm.backToSignIn')}
        </Button>
      </div>
    );
  }

  const errorMessage = resetPassword.isError
    ? getApiErrorMessage(resetPassword.error, t('ResetPasswordForm.genericError'))
    : null;

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {errorMessage && (
        <div className={styles.formError} role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <FormField label={t('ResetPasswordForm.newPasswordLabel')} error={errors.newPassword?.message} required>
        {(fieldProps) => (
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...fieldProps}
            {...register('newPassword')}
          />
        )}
      </FormField>

      <FormField label={t('ResetPasswordForm.confirmPasswordLabel')} error={errors.confirmPassword?.message} required>
        {(fieldProps) => (
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...fieldProps}
            {...register('confirmPassword')}
          />
        )}
      </FormField>

      <Button type="submit" fullWidth isLoading={resetPassword.isPending}>
        {t('ResetPasswordForm.submit')}
      </Button>

      <p className={styles.switchText}>
        <Link to={paths.login}>{t('ResetPasswordForm.backToSignIn')}</Link>
      </p>
    </form>
  );
}
