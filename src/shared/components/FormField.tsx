import type { ReactNode } from 'react';
import { useId } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (fieldProps: { id: string; invalid: boolean; 'aria-describedby'?: string }) => ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  const fieldId = useId();
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {children({ id: fieldId, invalid: Boolean(error), 'aria-describedby': errorId ?? hintId })}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
