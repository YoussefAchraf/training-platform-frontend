import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { paths } from '@/routes/paths';
import { useSignup } from '../hooks/useSignup';
import styles from './AuthForm.module.css';

const signupSchema = z
  .object({
    firstname: z.string().trim().min(1, 'First name is required').max(100),
    lastname: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['Sales', 'Manager', 'Instructor'], { error: 'Select a role' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const signup = useSignup();

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
          <span>{getApiErrorMessage(signup.error, 'Unable to create your account. Please try again.')}</span>
        </div>
      )}

      <div className={styles.row}>
        <FormField label="First name" error={errors.firstname?.message} required>
          {(fieldProps) => (
            <Input autoComplete="given-name" placeholder="Jane" {...fieldProps} {...register('firstname')} />
          )}
        </FormField>

        <FormField label="Last name" error={errors.lastname?.message} required>
          {(fieldProps) => (
            <Input autoComplete="family-name" placeholder="Doe" {...fieldProps} {...register('lastname')} />
          )}
        </FormField>
      </div>

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

      <FormField
        label="Role"
        error={errors.role?.message}
        hint="A Manager must approve your account before you can sign in."
        required
      >
        {(fieldProps) => (
          <Select {...fieldProps} {...register('role')} defaultValue="">
            <option value="" disabled>
              Select your role
            </option>
            <option value="Sales">Sales</option>
            <option value="Manager">Manager</option>
            <option value="Instructor">Instructor</option>
          </Select>
        )}
      </FormField>

      <div className={styles.row}>
        <FormField label="Password" error={errors.password?.message} required>
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

        <FormField label="Confirm password" error={errors.confirmPassword?.message} required>
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
        Create account
      </Button>

      <p className={styles.switchText}>
        Already have an account? <Link to={paths.login}>Sign in</Link>
      </p>
    </form>
  );
}
