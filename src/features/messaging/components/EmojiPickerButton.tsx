import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Smile } from 'lucide-react';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import styles from './MessageThread.module.css';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

interface EmojiPickerButtonProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ onSelect }: EmojiPickerButtonProps) {
  const { t } = useTranslation('messaging');
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles.emojiWrap} ref={containerRef}>
      <button
        type="button"
        className={styles.composerIconButton}
        onClick={() => setOpen((value) => !value)}
        aria-label={t('MessageThread.emoji')}
      >
        <Smile size={20} />
      </button>
      {open && (
        <div className={styles.emojiPopover}>
          <Suspense fallback={<div className={styles.emojiLoading}>{t('PeopleDirectory.loading')}</div>}>
            <EmojiPicker
              width={isDesktop ? 320 : 300}
              height={360}
              onEmojiClick={(emojiData) => {
                onSelect(emojiData.emoji);
              }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
