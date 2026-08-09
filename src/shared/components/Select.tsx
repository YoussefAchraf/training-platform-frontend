import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid = false, className, children, ...rest }, ref) => {
    return (
      <div className={styles.wrapper}>
        <select
          ref={ref}
          className={cn(styles.select, invalid && styles.invalid, className)}
          aria-invalid={invalid || undefined}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
      </div>
    );
  },
);

Select.displayName = 'Select';
