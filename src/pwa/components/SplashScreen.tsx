import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { splashContainer, splashExit, splashMark, splashText } from '../motion/pwaVariants';
import styles from './SplashScreen.module.css';

const SESSION_KEY = 'pwa-splash-shown';
const VISIBLE_MS = 700;

function shouldShow(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) !== '1';
}


export function SplashScreen() {
  const [visible, setVisible] = useState(shouldShow);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(timer);
    
    
    
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.wrapper}
          variants={splashExit}
          initial="show"
          exit="exit"
        >
          <motion.div className={styles.content} variants={splashContainer} initial="hidden" animate="show">
            <motion.span className={styles.mark} variants={splashMark}>
              <GraduationCap size={36} />
            </motion.span>
            <motion.span className={styles.wordmark} variants={splashText}>
              Training Platform
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
