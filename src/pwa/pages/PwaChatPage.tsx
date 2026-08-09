import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { ChatConversation } from '@/features/chatbot/components/ChatConversation';
import { useChatStore } from '@/features/chatbot/chatStore';
import { useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { useViewportFillHeight } from '@/shared/hooks/useViewportFillHeight';
import { cn } from '@/shared/utils/cn';
import styles from './PwaChatPage.module.css';





















export function PwaChatPage() {
  const startNewConversation = useChatStore((state) => state.startNewConversation);
  const navigate = useNavigate();
  const deviceClass = useStandaloneDeviceClass();
  const isPhone = deviceClass === 'phone';
  const isDesktop = deviceClass === 'desktop';
  
  
  
  const { ref: fillRef, height: fillHeight } = useViewportFillHeight<HTMLDivElement>(0);

  const header = (
    <header className={styles.header}>
      <span className={styles.headerLeading}>
        {isPhone && (
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <span className={styles.title}>Assistant</span>
      </span>
      <button
        type="button"
        className={styles.newChatButton}
        onClick={startNewConversation}
        aria-label="Start a new conversation"
        title="New conversation"
      >
        <Plus size={16} />
      </button>
    </header>
  );

  if (isPhone) {
    return createPortal(
      <div className={styles.fullscreen}>
        {header}
        <ChatConversation />
      </div>,
      document.body,
    );
  }

  return (
    <div
      ref={isDesktop ? fillRef : undefined}
      className={cn(styles.page, isDesktop && styles.pageFullBleed)}
      style={isDesktop ? { height: fillHeight } : undefined}
    >
      {header}
      <ChatConversation />
    </div>
  );
}
