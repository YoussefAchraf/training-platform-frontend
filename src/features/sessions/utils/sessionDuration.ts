import { addDays, addHours, format } from 'date-fns';
import type { TrainingDurationUnit } from '@/shared/types/domain';






function addTrainingDays(start: Date, duration: number, skipWeekends: boolean): Date {
  let end = start;
  let daysCounted = 1;
  while (daysCounted < duration) {
    end = addDays(end, 1);
    if (skipWeekends) {
      const day = end.getDay();
      if (day === 0 || day === 6) continue;
    }
    daysCounted += 1;
  }
  return end;
}





export function computeSessionEndDate(
  startDateLocal: string,
  duration: number,
  durationUnit: TrainingDurationUnit,
  skipWeekends: boolean,
): string | null {
  const start = new Date(startDateLocal);
  if (Number.isNaN(start.getTime())) return null;

  const end =
    durationUnit === 'hours' ? addHours(start, duration) : addTrainingDays(start, duration, skipWeekends);

  return format(end, "yyyy-MM-dd'T'HH:mm");
}
