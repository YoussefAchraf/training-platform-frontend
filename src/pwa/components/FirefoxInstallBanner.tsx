import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Menu, SquarePlus, X } from 'lucide-react';
import { popIn } from '@/shared/motion/variants';
import { useFirefoxInstallHint } from '../hooks/usePwaInstall';
import styles from './InstallBanner.module.css';

export function FirefoxInstallBanner() {
  const { t } = useTranslation('pwa');
  const { canShowHint, dismiss } = useFirefoxInstallHint();

  return (
    <AnimatePresence>
      {canShowHint && (
        <motion.div className={styles.banner} variants={popIn} initial="hidden" animate="show" exit="exit">
          <img src="/icon-192.png" alt="" className={styles.icon} width={44} height={44} />
          <div className={styles.text}>
            <p className={styles.title}>{t('FirefoxInstallBanner.title')}</p>
            <p className={styles.subtitle}>
              {t('FirefoxInstallBanner.beforeMenuIcon')} <Menu size={13} className={styles.inlineIcon} aria-label={t('FirefoxInstallBanner.menuIconLabel')} />
              {t('FirefoxInstallBanner.betweenIcons')}{' '}
              <SquarePlus size={13} className={styles.inlineIcon} aria-label={t('FirefoxInstallBanner.installIconLabel')} /> {t('FirefoxInstallBanner.afterInstallIcon')}
            </p>
          </div>
          <button type="button" className={styles.dismiss} onClick={dismiss} aria-label={t('FirefoxInstallBanner.notNow')}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
