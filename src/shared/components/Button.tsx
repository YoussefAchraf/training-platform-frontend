import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          isLoading && styles.loading,
          className,
        )}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        whileTap={!isDisabled && !shouldReduceMotion ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.12 }}
        {...rest}
      >
        {isLoading && <Loader2 className={styles.spinner} size={16} aria-hidden="true" />}
        {!isLoading && leftIcon}
        <span className={styles.label}>{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
