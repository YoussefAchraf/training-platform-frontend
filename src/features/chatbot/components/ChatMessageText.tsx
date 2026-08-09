import type { ReactNode } from 'react';
import styles from './ChatWidget.module.css';




function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part ? <span key={`${keyPrefix}-${index}`}>{part}</span> : null;
  });
}

interface ChatMessageTextProps {
  content: string;
}

export function ChatMessageText({ content }: ChatMessageTextProps) {
  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, index) => {
        const key = `line-${index}`;
        const trimmed = line.trim();

        if (trimmed === '***' || trimmed === '---') {
          return <hr key={key} className={styles.messageDivider} />;
        }
        if (trimmed === '') {
          return <div key={key} className={styles.messageBlankLine} />;
        }

        const bulletMatch = /^[-*]\s+(.*)/.exec(line);
        if (bulletMatch) {
          return (
            <div key={key} className={styles.messageListItem}>
              <span aria-hidden="true">•</span>
              <span>{renderInline(bulletMatch[1], key)}</span>
            </div>
          );
        }

        const numberedMatch = /^(\d+)\.\s+(.*)/.exec(line);
        if (numberedMatch) {
          return (
            <div key={key} className={styles.messageListItem}>
              <span aria-hidden="true">{numberedMatch[1]}.</span>
              <span>{renderInline(numberedMatch[2], key)}</span>
            </div>
          );
        }

        return <div key={key}>{renderInline(line, key)}</div>;
      })}
    </>
  );
}
