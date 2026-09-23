import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquareText } from 'lucide-react';
import { useIsDesktop, useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { useViewportFillHeight } from '@/shared/hooks/useViewportFillHeight';
import { useVisualViewportHeight } from '@/shared/hooks/useVisualViewportHeight';
import { cn } from '@/shared/utils/cn';
import { useMessagingUiStore } from '../messagingUiStore';
import { ConversationsPane } from '../components/ConversationsPane';
import { MessageThread } from '../components/MessageThread';
import styles from './MessagingPage.module.css';

export function MessagingPage() {
  const { t } = useTranslation('messaging');
  const navigate = useNavigate();
  const deviceClass = useStandaloneDeviceClass();
  const isPhone = deviceClass === 'phone';
  const isSplit = useIsDesktop();
  const selectedConversationId = useMessagingUiStore((state) => state.selectedConversationId);
  const { ref: fillRef, height: fillHeight } = useViewportFillHeight<HTMLDivElement>(0);
  const visualViewportHeight = useVisualViewportHeight();

  const showList = isSplit || selectedConversationId == null;
  const showThread = isSplit || selectedConversationId != null;

  const body = (
    <>
      {showList && (
        <div className={cn(styles.listPane, isSplit && styles.listPaneSplit)}>
          <ConversationsPane onBack={isPhone ? () => navigate(-1) : undefined} />
        </div>
      )}
      {showThread && (
        <div className={styles.threadPane}>
          {selectedConversationId != null ? (
            <MessageThread conversationId={selectedConversationId} />
          ) : (
            <div className={styles.emptyThread}>
              <MessageSquareText size={32} />
              <p>{t('MessagingPage.selectConversationPrompt')}</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (isPhone) {
    return createPortal(
      <div className={styles.fullscreen} style={visualViewportHeight ? { height: visualViewportHeight } : undefined}>
        {body}
      </div>,
      document.body,
    );
  }

  return (
    <div ref={fillRef} className={styles.page} style={{ height: fillHeight }}>
      {body}
    </div>
  );
}
