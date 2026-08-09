import { AnimatePresence, motion } from 'motion/react';
import { Share, SquarePlus, X } from 'lucide-react';
import { popIn } from '@/shared/motion/variants';
import { useIosInstallHint } from '../hooks/usePwaInstall';
import styles from './InstallBanner.module.css';





export function IOSInstallBanner() {
  const { canShowHint, dismiss } = useIosInstallHint();

  return (
    <AnimatePresence>
      {canShowHint && (
        <motion.div className={styles.banner} variants={popIn} initial="hidden" animate="show" exit="exit">
          <img src="/icon-192.png" alt="" className={styles.icon} width={44} height={44} />
          <div className={styles.text}>
            <p className={styles.title}>Install Training Platform</p>
            <p className={styles.subtitle}>
              Tap <Share size={13} className={styles.inlineIcon} aria-label="Share" />, then{' '}
              <SquarePlus size={13} className={styles.inlineIcon} aria-label="Add" /> Add to Home Screen.
            </p>
          </div>
          <button type="button" className={styles.dismiss} onClick={dismiss} aria-label="Not now">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
