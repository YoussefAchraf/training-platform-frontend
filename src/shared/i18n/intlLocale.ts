import i18n from '@/shared/i18n';

const INTL_LOCALES = { en: 'en-US', fr: 'fr-FR' } as const;





export function currentIntlLocale(): string {
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2) as keyof typeof INTL_LOCALES;
  return INTL_LOCALES[lang] ?? 'en-US';
}
