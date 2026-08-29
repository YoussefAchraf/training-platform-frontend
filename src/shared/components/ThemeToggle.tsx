import { useTranslation } from 'react-i18next';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Theme } from '@/shared/store/themeStore';
import styles from './ThemeToggle.module.css';

const themeOptions: Array<{ value: Theme; labelKey: string; icon: typeof Sun }> = [
  { value: 'light', labelKey: 'ThemeToggle.light', icon: Sun },
  { value: 'dark', labelKey: 'ThemeToggle.dark', icon: Moon },
  { value: 'system', labelKey: 'ThemeToggle.system', icon: Monitor },
];

interface ThemeToggleProps {
  className?: string;
}


export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation('common');
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn(styles.row, className)} role="radiogroup" aria-label={t('ThemeToggle.label')}>
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          className={cn(styles.option, theme === option.value && styles.optionActive)}
          onClick={() => setTheme(option.value)}
          title={t(option.labelKey)}
        >
          <option.icon size={15} />
        </button>
      ))}
    </div>
  );
}
