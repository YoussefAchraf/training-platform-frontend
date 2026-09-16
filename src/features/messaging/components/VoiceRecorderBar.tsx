import { useTranslation } from 'react-i18next';
import { Send, Trash2 } from 'lucide-react';
import styles from './MessageThread.module.css';

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

interface VoiceRecorderBarProps {
  elapsedSeconds: number;
  onCancel: () => void;
  onSend: () => void;
}

export function VoiceRecorderBar({ elapsedSeconds, onCancel, onSend }: VoiceRecorderBarProps) {
  const { t } = useTranslation('messaging');

  return (
    <div className={styles.recordingBar}>
      <button
        type="button"
        className={styles.recordingCancelButton}
        onClick={onCancel}
        aria-label={t('MessageThread.cancelRecording')}
      >
        <Trash2 size={18} />
      </button>
      <span className={styles.recordingIndicator}>
        <span className={styles.recordingDot} aria-hidden="true" />
        {t('MessageThread.recordingLabel')}
        <span className={styles.recordingTimer}>{formatElapsed(elapsedSeconds)}</span>
      </span>
      <button
        type="button"
        className={styles.sendButton}
        onClick={onSend}
        aria-label={t('MessageThread.send')}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
