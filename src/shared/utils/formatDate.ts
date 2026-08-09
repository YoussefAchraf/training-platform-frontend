import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(iso: string, pattern = 'MMM d, yyyy'): string {
  const date = parseISO(iso);
  return isValid(date) ? format(date, pattern) : '—';
}

export function formatDateTime(iso: string): string {
  return formatDate(iso, "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(iso: string): string {
  return formatDate(iso, 'h:mm a');
}

export function formatRelative(iso: string): string {
  const date = parseISO(iso);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}

export function toDatetimeLocalValue(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
