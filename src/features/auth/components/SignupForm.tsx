import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AlertCircle } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { paths } from '@/routes/paths';
import { useSignup } from '../hooks/useSignup';
import styles from './AuthForm.module.css';

function buildSignupSchema(t: TFunction<'auth'>) {
  return z
    .object({
      firstname: z.string().trim().min(1, t('SignupForm.errors.firstnameRequired')).max(100),
      lastname: z.string().trim().min(1, t('SignupForm.errors.lastnameRequired')).max(100),
      email: z.email(t('SignupForm.errors.emailInvalid')),
      password: z.string().min(8, t('SignupForm.errors.passwordMin')),
      confirmPassword: z.string().min(1, t('SignupForm.errors.confirmPasswordRequired')),
      role: z.enum(['Sales', 'Manager', 'Instructor'], { error: t('SignupForm.errors.roleRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('SignupForm.errors.passwordsMismatch'),
      path: ['confirmPassword'],
    });
}

type SignupFormValues = z.infer<ReturnType<typeof buildSignupSchema>>;

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { t } = useTranslation('auth');
  const signup = useSignup();
  const signupSchema = useMemo(() => buildSignupSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit(({ confirmPassword: _confirmPassword, ...payload }) => {
    signup.mutate(payload, { onSuccess });
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {signup.isError && (
        <div className={styles.formError} role="alert">
          <AlertCircle size={16} />
          <span>{getApiErrorMessage(signup.error, t('SignupForm.genericError'))}</span>
        </div>
      )}

      <div className={styles.row}>
        <FormField label={t('SignupForm.firstnameLabel')} error={errors.firstname?.message} required>
          {(fieldProps) => (
            <Input autoComplete="given-name" placeholder={t('SignupForm.firstnamePlaceholder')} {...fieldProps} {...register('firstname')} />
          )}
        </FormField>

        <FormField label={t('SignupForm.lastnameLabel')} error={errors.lastname?.message} required>
          {(fieldProps) => (
            <Input autoComplete="family-name" placeholder={t('SignupForm.lastnamePlaceholder')} {...fieldProps} {...register('lastname')} />
          )}
        </FormField>
      </div>

      <FormField label={t('SignupForm.emailLabel')} error={errors.email?.message} required>
        {(fieldProps) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder={t('SignupForm.emailPlaceholder')}
            {...fieldProps}
            {...register('email')}
          />
        )}
      </FormField>

      <FormField
        label={t('SignupForm.roleLabel')}
        error={errors.role?.message}
        hint={t('SignupForm.roleHint')}
        required
      >
        {(fieldProps) => (
          <Select {...fieldProps} {...register('role')} defaultValue="">
            <option value="" disabled>
              {t('SignupForm.selectRole')}
            </option>
            <option value="Sales">{t('common:Status.roleSales')}</option>
            <option value="Manager">{t('common:Status.roleManager')}</option>
            <option value="Instructor">{t('common:Status.roleInstructor')}</option>
          </Select>
        )}
      </FormField>

      <div className={styles.row}>
        <FormField label={t('SignupForm.passwordLabel')} error={errors.password?.message} required>
          {(fieldProps) => (
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...fieldProps}
              {...register('password')}
            />
          )}
        </FormField>

        <FormField label={t('SignupForm.confirmPasswordLabel')} error={errors.confirmPassword?.message} required>
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
      </div>

      <Button type="submit" fullWidth isLoading={signup.isPending}>
        {t('SignupForm.createAccount')}
      </Button>

      <p className={styles.switchText}>
        {t('SignupForm.haveAccount')} <Link to={paths.login}>{t('SignupForm.signIn')}</Link>
      </p>
    </form>
  );
}
