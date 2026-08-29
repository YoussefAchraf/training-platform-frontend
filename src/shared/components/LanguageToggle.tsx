import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/utils/cn';
import styles from './LanguageToggle.module.css';

interface LanguageToggleProps {
  className?: string;
}

const languageOptions = [
  { value: 'en', abbreviation: 'EN', labelKey: 'LanguageToggle.english' },
  { value: 'fr', abbreviation: 'FR', labelKey: 'LanguageToggle.french' },
] as const;


export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t, i18n } = useTranslation('common');
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className={cn(styles.row, className)} role="radiogroup" aria-label={t('LanguageToggle.label')}>
      {languageOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={activeLanguage === option.value}
          className={cn(styles.option, activeLanguage === option.value && styles.optionActive)}
          onClick={() => void i18n.changeLanguage(option.value)}
          title={t(option.labelKey)}
        >
          {option.abbreviation}
        </button>
      ))}
    </div>
  );
}
