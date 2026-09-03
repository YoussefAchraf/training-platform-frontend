import { useEffect, useId } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { easeOut } from '@/shared/motion/variants';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  
  dismissible?: boolean;
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const desktopDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.15, ease: easeOut } },
};

const mobileDialogVariants: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: { type: 'spring', damping: 32, stiffness: 320 } },
  exit: { y: '100%', transition: { duration: 0.22, ease: easeOut } },
};

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: ModalProps) {
  const { t } = useTranslation('common');
  const titleId = useId();
  const isDesktop = useIsDesktop();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (dismissible && event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, dismissible, onClose]);

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();
  const handleOverlayClick = dismissible ? onClose : undefined;

  const dialogVariants = shouldReduceMotion
    ? reducedMotionVariants
    : isDesktop
      ? desktopDialogVariants
      : mobileDialogVariants;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={handleOverlayClick}
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div
            className={cn(styles.dialog, styles[size])}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={stopPropagation}
            variants={dialogVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className={styles.handle} aria-hidden="true" />
            <div className={styles.header}>
              <div className={styles.headerText}>
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
                {description && <p className={styles.description}>{description}</p>}
              </div>
              {dismissible && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label={t('Modal.closeDialog')}
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {children && <div className={styles.body}>{children}</div>}
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
