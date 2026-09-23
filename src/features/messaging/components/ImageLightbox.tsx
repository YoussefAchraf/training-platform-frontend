import { useEffect } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Download, X } from 'lucide-react';
import styles from './ImageLightbox.module.css';

interface ImageLightboxProps {
  src: string;
  alt: string;
  downloadHref?: string;
  onClose: () => void;
}


export function ImageLightbox({ src, alt, downloadHref, onClose }: ImageLightboxProps) {
  const { t } = useTranslation(['messaging', 'common']);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();
  const transition = shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        <div className={styles.toolbar} onClick={stopPropagation}>
          {downloadHref && (
            <a
              href={downloadHref}
              download
              className={styles.toolbarButton}
              aria-label={t('ImageLightbox.download')}
              onClick={stopPropagation}
            >
              <Download size={20} />
            </a>
          )}
          <button type="button" className={styles.toolbarButton} onClick={onClose} aria-label={t('common:Modal.closeDialog')}>
            <X size={22} />
          </button>
        </div>
        <motion.img
          src={src}
          alt={alt}
          className={styles.image}
          onClick={stopPropagation}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={transition}
        />
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
