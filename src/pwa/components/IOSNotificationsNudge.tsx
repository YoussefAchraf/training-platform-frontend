import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Bell, X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { popIn } from '@/shared/motion/variants';
import { useIosNotificationsNudge } from '../hooks/usePwaInstall';
import styles from './IOSNotificationsNudge.module.css';


export function IOSNotificationsNudge() {
  const { t } = useTranslation('pwa');
  const { canShowNudge, enable, dismiss } = useIosNotificationsNudge();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      await enable();
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <AnimatePresence>
      {canShowNudge && (
        <motion.div className={styles.banner} variants={popIn} initial="hidden" animate="show" exit="exit">
          <div className={styles.icon}>
            <Bell size={20} />
          </div>
          <div className={styles.text}>
            <p className={styles.title}>{t('IOSNotificationsNudge.title')}</p>
            <p className={styles.subtitle}>{t('IOSNotificationsNudge.subtitle')}</p>
          </div>
          <div className={styles.actions}>
            <Button size="sm" onClick={handleEnable} isLoading={isEnabling}>
              {t('IOSNotificationsNudge.enable')}
            </Button>
            <button type="button" className={styles.dismiss} onClick={dismiss} aria-label={t('IOSNotificationsNudge.notNow')}>
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
