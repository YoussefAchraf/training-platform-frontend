import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Input.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid = false, className, rows = 4, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(styles.input, invalid && styles.invalid, className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
