import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { combineDateAndTime, computeDaysNeeded, computeSessionEndDay, hoursBetweenTimes } from './sessionDuration';




function isoDate(date: Date | null): string | null {
  return date ? format(date, 'yyyy-MM-dd') : null;
}

describe('computeSessionEndDay', () => {
  it('returns null for an unparseable start date', () => {
    expect(computeSessionEndDay('not-a-date', 3, 'days', 8, false)).toBeNull();
  });

  it('returns null when hoursPerDay is missing or not positive', () => {
    expect(computeSessionEndDay('2026-08-17', 3, 'days', 0, false)).toBeNull();
    expect(computeSessionEndDay('2026-08-17', 3, 'days', -1, false)).toBeNull();
  });

  it('returns null when duration is missing or not positive', () => {
    expect(computeSessionEndDay('2026-08-17', 0, 'days', 8, false)).toBeNull();
  });

  describe('hours unit - fixed daily window, same every day including the last', () => {
    it('fits in a single day when total hours is within one day', () => {
      
      expect(isoDate(computeSessionEndDay('2026-08-17', 6, 'hours', 8, false))).toBe('2026-08-17');
    });

    it('divides evenly across days', () => {
      expect(isoDate(computeSessionEndDay('2026-08-17', 16, 'hours', 8, false))).toBe('2026-08-18');
    });

    it('rounds up to a full extra day for a partial remainder - the last day still runs the full window', () => {
      
      
      expect(isoDate(computeSessionEndDay('2026-08-17', 10, 'hours', 8, false))).toBe('2026-08-18');
    });

    it('skips weekends when spreading a multi-day hours training across days', () => {
      
      
      expect(isoDate(computeSessionEndDay('2026-08-20', 24, 'hours', 8, true))).toBe('2026-08-24');
    });
  });

  describe('days unit', () => {
    it('counts the start day itself as day 1', () => {
      expect(isoDate(computeSessionEndDay('2026-08-20', 1, 'days', 8, false))).toBe('2026-08-20');
    });

    it('a 5-day training starting Thursday lands on Monday when weekends count', () => {
      expect(isoDate(computeSessionEndDay('2026-08-20', 5, 'days', 8, false))).toBe('2026-08-24');
    });

    it('a 5-day training starting Thursday lands on Wednesday when weekends are skipped', () => {
      expect(isoDate(computeSessionEndDay('2026-08-20', 5, 'days', 8, true))).toBe('2026-08-26');
    });

    it('is unaffected by hoursPerDay - the day count is already given directly', () => {
      const withEight = computeSessionEndDay('2026-08-20', 3, 'days', 8, false);
      const withFour = computeSessionEndDay('2026-08-20', 3, 'days', 4, false);
      expect(isoDate(withEight)).toBe(isoDate(withFour));
    });
  });
});

describe('computeDaysNeeded', () => {
  it('returns null when hoursPerDay or duration is missing/not positive', () => {
    expect(computeDaysNeeded(3, 'days', 0)).toBeNull();
    expect(computeDaysNeeded(0, 'days', 8)).toBeNull();
  });

  it('is the duration itself for a days-unit training', () => {
    expect(computeDaysNeeded(5, 'days', 8)).toBe(5);
  });

  it('rounds up for an hours-unit training that does not divide evenly', () => {
    expect(computeDaysNeeded(10, 'hours', 8)).toBe(2);
    expect(computeDaysNeeded(6, 'hours', 8)).toBe(1);
    expect(computeDaysNeeded(24, 'hours', 8)).toBe(3);
  });
});

describe('hoursBetweenTimes', () => {
  it('computes the span between two times', () => {
    expect(hoursBetweenTimes('10:20', '18:20')).toBe(8);
  });

  it('handles a fractional span', () => {
    expect(hoursBetweenTimes('09:00', '13:30')).toBe(4.5);
  });

  it('returns null when the end time is before the start time', () => {
    expect(hoursBetweenTimes('18:00', '09:00')).toBeNull();
  });

  it('returns null when the end time equals the start time', () => {
    expect(hoursBetweenTimes('09:00', '09:00')).toBeNull();
  });

  it('returns null for an unparseable time', () => {
    expect(hoursBetweenTimes('', '18:00')).toBeNull();
    expect(hoursBetweenTimes('9am', '18:00')).toBeNull();
  });
});

describe('combineDateAndTime', () => {
  it('combines a date and a time into a datetime-local value', () => {
    expect(combineDateAndTime('2026-08-20', '10:20')).toBe('2026-08-20T10:20');
  });

  it('returns null when either part is missing', () => {
    expect(combineDateAndTime('', '10:20')).toBeNull();
    expect(combineDateAndTime('2026-08-20', '')).toBeNull();
  });
});
