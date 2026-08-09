import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useUiStore } from '@/shared/store/uiStore';
import type { ToastItem } from '@/shared/store/uiStore';
import { cn } from '@/shared/utils/cn';
import { easeOut } from '@/shared/motion/variants';
import styles from './ToastViewport.module.css';

const TONE_ICON = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const AUTO_DISMISS_MS = 5000;

const toastVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.18, ease: easeOut } },
};

function ToastRow({ toast }: { toast: ToastItem }) {
  const dismissToast = useUiStore((state) => state.dismissToast);
  const shouldReduceMotion = useReducedMotion();
  const Icon = TONE_ICON[toast.tone];

  useEffect(() => {
    if (toast.persistent) return;
    const timer = setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, toast.persistent, dismissToast]);

  return (
    <motion.div
      layout
      variants={shouldReduceMotion ? undefined : toastVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={cn(styles.toast, styles[toast.tone])}
      role="status"
    >
      <Icon size={20} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.action?.onClick();
            dismissToast(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);

  return (
    <div className={styles.viewport} aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastRow key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
