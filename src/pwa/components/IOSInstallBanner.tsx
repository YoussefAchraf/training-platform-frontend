import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Share, SquarePlus, X } from 'lucide-react';
import { popIn } from '@/shared/motion/variants';
import { useIosInstallHint } from '../hooks/usePwaInstall';
import styles from './InstallBanner.module.css';





export function IOSInstallBanner() {
  const { t } = useTranslation('pwa');
  const { canShowHint, dismiss } = useIosInstallHint();

  return (
    <AnimatePresence>
      {canShowHint && (
        <motion.div className={styles.banner} variants={popIn} initial="hidden" animate="show" exit="exit">
          <img src="/icon-192.png" alt="" className={styles.icon} width={44} height={44} />
          <div className={styles.text}>
            <p className={styles.title}>{t('IOSInstallBanner.title')}</p>
            <p className={styles.subtitle}>
              {t('IOSInstallBanner.beforeShareIcon')} <Share size={13} className={styles.inlineIcon} aria-label={t('IOSInstallBanner.shareIconLabel')} />
              {t('IOSInstallBanner.betweenIcons')}{' '}
              <SquarePlus size={13} className={styles.inlineIcon} aria-label={t('IOSInstallBanner.addIconLabel')} /> {t('IOSInstallBanner.afterAddIcon')}
            </p>
          </div>
          <button type="button" className={styles.dismiss} onClick={dismiss} aria-label={t('IOSInstallBanner.notNow')}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
