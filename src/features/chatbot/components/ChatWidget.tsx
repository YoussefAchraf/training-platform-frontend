import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { MessageCircle, RotateCcw, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { easeOut } from '@/shared/motion/variants';
import { CHATBOT_WEBHOOK_URL } from '../api/chatbotClient';
import { useChatStore } from '../chatStore';
import { ChatConversation } from './ChatConversation';
import styles from './ChatWidget.module.css';

const bubbleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, scale: 0.6, transition: { duration: 0.15, ease: easeOut } },
};

const desktopPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.15, ease: easeOut } },
};

const mobilePanelVariants: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: { type: 'spring', damping: 32, stiffness: 320 } },
  exit: { y: '100%', transition: { duration: 0.2, ease: easeOut } },
};

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};






export function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const isOpen = useChatStore((state) => state.isOpen);
  const toggle = useChatStore((state) => state.toggle);
  const close = useChatStore((state) => state.close);
  const startNewConversation = useChatStore((state) => state.startNewConversation);

  const isDesktop = useIsDesktop();
  const shouldReduceMotion = useReducedMotion();

  if (!CHATBOT_WEBHOOK_URL || !isAuthenticated) {
    return null;
  }

  const panelVariants = shouldReduceMotion
    ? reducedMotionVariants
    : isDesktop
      ? desktopPanelVariants
      : mobilePanelVariants;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            className={styles.bubble}
            onClick={toggle}
            aria-label="Open chat assistant"
            variants={bubbleVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="false"
            aria-label="Chat assistant"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <MessageCircle size={18} />
                <span>Assistant</span>
              </div>
              <div className={styles.headerActions}>
                <button
                  type="button"
                  className={styles.headerButton}
                  onClick={startNewConversation}
                  aria-label="Start a new conversation"
                  title="New conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button type="button" className={styles.headerButton} onClick={close} aria-label="Close chat">
                  <X size={18} />
                </button>
              </div>
            </div>

            <ChatConversation />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
