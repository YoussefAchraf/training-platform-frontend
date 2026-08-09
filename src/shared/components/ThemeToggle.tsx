import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Theme } from '@/shared/store/themeStore';
import styles from './ThemeToggle.module.css';

const themeOptions: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

interface ThemeToggleProps {
  className?: string;
}


export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn(styles.row, className)} role="radiogroup" aria-label="Theme">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          className={cn(styles.option, theme === option.value && styles.optionActive)}
          onClick={() => setTheme(option.value)}
          title={option.label}
        >
          <option.icon size={15} />
        </button>
      ))}
    </div>
  );
}
