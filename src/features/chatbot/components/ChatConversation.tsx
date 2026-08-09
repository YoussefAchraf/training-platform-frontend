import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Send } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import { useChatStore } from '../chatStore';
import { useSendChatMessage } from '../hooks/useSendChatMessage';
import { ChatMessageText } from './ChatMessageText';
import styles from './ChatWidget.module.css';

function TypingIndicator() {
  return (
    <div className={styles.typingBubble} aria-live="polite" aria-label="Assistant is typing">
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  );
}


export function ChatConversation() {
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useSendChatMessage();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sendMessage.isPending]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sendMessage.isPending) return;
    setDraft('');
    sendMessage.mutate(trimmed);
  };

  return (
    <>
      <div className={styles.messages} ref={listRef}>
        {messages.length === 0 && !sendMessage.isPending && (
          <div className={styles.emptyState}>
            <MessageCircle size={28} />
            <p>Ask me anything about your trainings, sessions or clients.</p>
          </div>
        )}
        <motion.div variants={staggerContainer(0.04)} initial="hidden" animate="show">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={listItem}
              className={cn(
                styles.messageRow,
                message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
              )}
            >
              <div
                className={cn(
                  styles.messageBubble,
                  message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant,
                )}
              >
                <ChatMessageText content={message.content} />
              </div>
            </motion.div>
          ))}
        </motion.div>
        {sendMessage.isPending && (
          <div className={cn(styles.messageRow, styles.messageRowAssistant)}>
            <TypingIndicator />
          </div>
        )}
      </div>

      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type a message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={sendMessage.isPending}
          aria-label="Message"
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!draft.trim() || sendMessage.isPending}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </>
  );
}
