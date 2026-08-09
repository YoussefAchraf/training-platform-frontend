import { AnimatePresence, motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import styles from './OfflineBanner.module.css';





export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          className={styles.banner}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.content}>
            <WifiOff size={14} />
            <span>You&apos;re offline — showing the last saved data where available.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
