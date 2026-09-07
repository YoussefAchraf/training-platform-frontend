import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './ViewToggle.module.css';

export interface ViewToggleOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface ViewToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewToggleOption<T>[];
  id?: string;
  'aria-label'?: string;
}




export function ViewToggle<T extends string>({ value, onChange, options, id, 'aria-label': ariaLabel }: ViewToggleProps<T>) {
  return (
    <div className={styles.toggle} id={id} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(styles.button, value === option.value && styles.active)}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
