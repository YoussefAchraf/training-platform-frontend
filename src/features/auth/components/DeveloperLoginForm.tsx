import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AlertCircle, Clock } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { paths } from '@/routes/paths';
import { useDeveloperLogin } from '../hooks/useLogin';
import { establishSession } from '../establishSession';
import styles from './AuthForm.module.css';

function buildLoginSchema(t: TFunction<'auth'>) {
  return z.object({
    email: z.email(t('DeveloperLoginForm.errors.emailInvalid')),
    password: z.string().min(1, t('DeveloperLoginForm.errors.passwordRequired')),
  });
}

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

const COOLDOWN_AFTER_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 10;

export function DeveloperLoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const login = useDeveloperLogin();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const failedAttempts = useRef(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    cooldownTimer.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const onSubmit = handleSubmit((values) => {
    setError(null);
    login.mutate(values, {
      onSuccess: async (data) => {
        await establishSession(data.user);
        navigate(paths.developer, { replace: true });
      },
      onError: () => {
        setError(t('DeveloperLoginForm.genericError'));
        failedAttempts.current += 1;
        if (failedAttempts.current >= COOLDOWN_AFTER_ATTEMPTS) startCooldown();
      },
    });
  });

  const isLocked = cooldown > 0;

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate autoComplete="off">
      {error && (
        <div className={styles.formError} role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isLocked && (
        <div className={styles.formError} role="alert">
          <Clock size={16} />
          <span>{t('DeveloperLoginForm.tooManyAttempts', { seconds: cooldown })}</span>
        </div>
      )}

      <FormField label={t('DeveloperLoginForm.emailLabel')} error={errors.email?.message} required>
        {(fieldProps) => (
          <Input
            type="email"
            autoComplete="off"
            placeholder="developer@company.com"
            {...fieldProps}
            {...register('email')}
          />
        )}
      </FormField>

      <FormField label={t('DeveloperLoginForm.passwordLabel')} error={errors.password?.message} required>
        {(fieldProps) => (
          <Input type="password" autoComplete="off" placeholder="••••••••" {...fieldProps} {...register('password')} />
        )}
      </FormField>

      <Button type="submit" fullWidth isLoading={login.isPending} disabled={isLocked}>
        {isLocked ? t('DeveloperLoginForm.locked', { seconds: cooldown }) : t('DeveloperLoginForm.signIn')}
      </Button>
    </form>
  );
}
