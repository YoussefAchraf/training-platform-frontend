import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(styles.input, invalid && styles.invalid, className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';
