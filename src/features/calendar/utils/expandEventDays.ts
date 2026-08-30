import { addDays, isValid, parseISO, startOfDay } from 'date-fns';
import type { CalendarEvent } from '@/shared/types/domain';

function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}









export function expandEventDays(event: Pick<CalendarEvent, 'eventDate' | 'endDate' | 'includeWeekends'>): Date[] {
  const start = parseISO(event.eventDate);
  if (!isValid(start)) return [];

  const end = event.endDate ? parseISO(event.endDate) : start;
  if (!isValid(end) || end < start) return [start];

  
  
  
  const endDay = startOfDay(end);
  const days: Date[] = [start];
  let cursor = start;
  while (startOfDay(cursor) < endDay) {
    cursor = addDays(cursor, 1);
    if (isWeekendDay(cursor) && !event.includeWeekends) continue;
    days.push(cursor);
  }
  return days;
}
