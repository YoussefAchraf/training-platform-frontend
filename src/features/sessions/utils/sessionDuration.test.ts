import { describe, expect, it } from 'vitest';
import { computeSessionEndDate } from './sessionDuration';

describe('computeSessionEndDate', () => {
  it('returns null for an unparseable start value', () => {
    expect(computeSessionEndDate('not-a-date', 3, 'days', false)).toBeNull();
  });

  describe('hours unit', () => {
    it('adds hours within the same day', () => {
      expect(computeSessionEndDate('2026-08-17T09:00', 8, 'hours', false)).toBe('2026-08-17T17:00');
    });

    it('rolls over into the next day when it crosses midnight', () => {
      expect(computeSessionEndDate('2026-08-20T23:00', 3, 'hours', false)).toBe('2026-08-21T02:00');
    });

    it('ignores skipWeekends entirely - an hours-long training is same-day', () => {
      const withSkip = computeSessionEndDate('2026-08-21T09:00', 6, 'hours', true);
      const withoutSkip = computeSessionEndDate('2026-08-21T09:00', 6, 'hours', false);
      expect(withSkip).toBe(withoutSkip);
    });
  });

  describe('days unit, weekends included in the count', () => {
    it('counts the start day itself as day 1 (a 1-day training ends the same day)', () => {
      expect(computeSessionEndDate('2026-08-20T09:00', 1, 'days', false)).toBe('2026-08-20T09:00');
    });

    it('a 5-day training starting Thursday lands on Monday when weekends count', () => {
      
      expect(computeSessionEndDate('2026-08-20T09:00', 5, 'days', false)).toBe('2026-08-24T09:00');
    });
  });

  describe('days unit, weekends skipped', () => {
    it('a 5-day training starting Thursday lands on Wednesday when weekends are skipped', () => {
      
      expect(computeSessionEndDate('2026-08-20T09:00', 5, 'days', true)).toBe('2026-08-26T09:00');
    });

    it('gives the same result as not skipping when no weekend falls within the span', () => {
      
      const withSkip = computeSessionEndDate('2026-08-17T09:00', 3, 'days', true);
      const withoutSkip = computeSessionEndDate('2026-08-17T09:00', 3, 'days', false);
      expect(withSkip).toBe(withoutSkip);
      expect(withSkip).toBe('2026-08-19T09:00');
    });

    it('preserves the time-of-day across the computed range', () => {
      expect(computeSessionEndDate('2026-08-20T14:30', 5, 'days', true)).toBe('2026-08-26T14:30');
    });
  });
});
