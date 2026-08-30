import { addDays, parseISO } from 'date-fns';
import type { TrainingDurationUnit } from '@/shared/types/domain';

function addTrainingDays(start: Date, daysNeeded: number, skipWeekends: boolean): Date {
  let end = start;
  let daysCounted = 1;
  while (daysCounted < daysNeeded) {
    end = addDays(end, 1);
    if (skipWeekends) {
      const day = end.getDay();
      if (day === 0 || day === 6) continue;
    }
    daysCounted += 1;
  }
  return end;
}












export function computeDaysNeeded(duration: number, durationUnit: TrainingDurationUnit, hoursPerDay: number): number | null {
  if (!hoursPerDay || hoursPerDay <= 0) return null;
  if (!duration || duration <= 0) return null;
  return durationUnit === 'hours' ? Math.ceil(duration / hoursPerDay) : duration;
}

export function computeSessionEndDay(
  startDate: string,
  duration: number,
  durationUnit: TrainingDurationUnit,
  hoursPerDay: number,
  skipWeekends: boolean,
): Date | null {
  const start = parseISO(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const daysNeeded = computeDaysNeeded(duration, durationUnit, hoursPerDay);
  if (!daysNeeded) return null;
  return addTrainingDays(start, daysNeeded, skipWeekends);
}




export function hoursBetweenTimes(startTime: string, endTime: string): number | null {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return null;
  const diff = end - start;
  if (diff <= 0) return null;
  return diff / 60;
}

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time || '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}




export function combineDateAndTime(dateValue: string, timeValue: string): string | null {
  if (!dateValue || !timeValue) return null;
  return `${dateValue}T${timeValue}`;
}
