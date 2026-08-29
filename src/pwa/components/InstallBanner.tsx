import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { popIn } from '@/shared/motion/variants';
import { usePwaInstall } from '../hooks/usePwaInstall';
import styles from './InstallBanner.module.css';




export function InstallBanner() {
  const { t } = useTranslation('pwa');
  const { canShowBanner, promptInstall, dismiss } = usePwaInstall();

  return (
    <AnimatePresence>
      {canShowBanner && (
        <motion.div className={styles.banner} variants={popIn} initial="hidden" animate="show" exit="exit">
          <img src="/icon-192.png" alt="" className={styles.icon} width={44} height={44} />
          <div className={styles.text}>
            <p className={styles.title}>{t('InstallBanner.title')}</p>
            <p className={styles.subtitle}>{t('InstallBanner.subtitle')}</p>
          </div>
          <div className={styles.actions}>
            <Button size="sm" onClick={promptInstall}>
              {t('InstallBanner.install')}
            </Button>
            <button type="button" className={styles.dismiss} onClick={dismiss} aria-label={t('InstallBanner.notNow')}>
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
