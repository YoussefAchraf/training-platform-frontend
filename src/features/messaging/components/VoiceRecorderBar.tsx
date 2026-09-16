import { useTranslation } from 'react-i18next';
import { Send, Trash2 } from 'lucide-react';
import { formatDuration } from '../utils';
import styles from './MessageThread.module.css';

interface VoiceRecorderBarProps {
  elapsedSeconds: number;
  levels: number[];
  onCancel: () => void;
  onSend: () => void;
}

export function VoiceRecorderBar({ elapsedSeconds, levels, onCancel, onSend }: VoiceRecorderBarProps) {
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
        <span className={styles.recordingWaveform} aria-hidden="true">
          {levels.map((level, index) => (
            <span key={index} className={styles.recordingWaveformBar} style={{ height: `${8 + Math.round(level * 92)}%` }} />
          ))}
        </span>
        <span className={styles.recordingTimer}>{formatDuration(elapsedSeconds)}</span>
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
