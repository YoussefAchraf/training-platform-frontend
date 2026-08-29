import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import i18n from '@/shared/i18n';

const DATE_FNS_LOCALES = { en: enUS, fr } as const;

export function currentLocale() {
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2) as keyof typeof DATE_FNS_LOCALES;
  return DATE_FNS_LOCALES[lang] ?? enUS;
}

export function formatDate(iso: string, pattern = 'MMM d, yyyy'): string {
  const date = parseISO(iso);
  return isValid(date) ? format(date, pattern, { locale: currentLocale() }) : '—';
}

export function formatDateTime(iso: string): string {
  return formatDate(iso, "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(iso: string): string {
  return formatDate(iso, 'h:mm a');
}

export function formatRelative(iso: string): string {
  const date = parseISO(iso);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true, locale: currentLocale() }) : '—';
}

export function toDatetimeLocalValue(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
