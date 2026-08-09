import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...rest }, ref) => {
    return (
      <label className={cn(styles.wrapper, className)} htmlFor={id}>
        <span className={styles.box}>
          <input ref={ref} type="checkbox" id={id} className={styles.input} {...rest} />
          <Check className={styles.check} size={14} strokeWidth={3} aria-hidden="true" />
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
