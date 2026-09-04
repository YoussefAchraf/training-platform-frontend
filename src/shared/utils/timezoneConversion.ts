import i18n from '@/shared/i18n';

const INTL_LOCALES = { en: 'en-US', fr: 'fr-FR' } as const;

function currentIntlLocale(): string {
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2) as keyof typeof INTL_LOCALES;
  return INTL_LOCALES[lang] ?? 'en-US';
}













export function zonedTimeToUtcIso(dateStr: string, timeStr: string, timeZone: string): string | null {
  if (!dateStr || !timeStr) return null;
  const naiveUtc = new Date(`${dateStr}T${timeStr}:00Z`);
  if (Number.isNaN(naiveUtc.getTime())) return null;

  const asUtc = new Date(naiveUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
  const asZoned = new Date(naiveUtc.toLocaleString('en-US', { timeZone }));
  const offsetMs = asUtc.getTime() - asZoned.getTime();

  return new Date(naiveUtc.getTime() + offsetMs).toISOString();
}

// The inverse read, as separate `yyyy-MM-dd`/`HH:mm` parts rather than a
// display string - for pre-filling date/time form inputs with the client's
// own wall-clock reading of a stored UTC instant (e.g. editing a session:
// the fields must show what the client's local time actually was, not
// whatever the browser's own local timezone happens to be).
export function utcIsoToZonedParts(iso: string, timeZone: string): { date: string; time: string } {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return { date: '', time: '' };
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(instant);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  // Midnight can format as "24:00" under hour12:false in some engines.
  const hour = get('hour') === '24' ? '00' : get('hour');
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${hour}:${get('minute')}` };
}

// The inverse read: what a UTC instant looks like as a wall-clock
// date+time in `timeZone`, for display.
export function formatDateTimeInZone(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(currentIntlLocale(), {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
