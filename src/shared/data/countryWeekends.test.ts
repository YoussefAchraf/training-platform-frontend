import { describe, expect, it } from 'vitest';
import { getWeekendDays, formatWeekendDays } from './countryWeekends';

describe('getWeekendDays', () => {
  it('defaults to Saturday-Sunday when no country is given', () => {
    expect(getWeekendDays(undefined)).toEqual([6, 0]);
    expect(getWeekendDays(null)).toEqual([6, 0]);
    expect(getWeekendDays('')).toEqual([6, 0]);
  });

  it('defaults to Saturday-Sunday for a country with no documented exception', () => {
    expect(getWeekendDays('FR')).toEqual([6, 0]);
    expect(getWeekendDays('US')).toEqual([6, 0]);
  });

  it('returns Saturday-Sunday for the UAE, which moved off Friday-Saturday in 2022', () => {
    expect(getWeekendDays('AE')).toEqual([6, 0]);
  });

  it('returns Friday-Saturday for the well-documented Gulf/North Africa bloc', () => {
    expect(getWeekendDays('SA')).toEqual([5, 6]);
    expect(getWeekendDays('EG')).toEqual([5, 6]);
    expect(getWeekendDays('IL')).toEqual([5, 6]);
  });

  it('returns a single Friday for Iran', () => {
    expect(getWeekendDays('IR')).toEqual([5]);
  });

  it('returns a single Saturday for Nepal', () => {
    expect(getWeekendDays('NP')).toEqual([6]);
  });

  it('is case-insensitive', () => {
    expect(getWeekendDays('eg')).toEqual([5, 6]);
  });
});

describe('formatWeekendDays', () => {
  it('reads Saturday first for the default weekend, matching how people actually say it', () => {
    expect(formatWeekendDays(undefined)).toBe('Saturday and Sunday');
    expect(formatWeekendDays('FR')).toBe('Saturday and Sunday');
  });

  it('formats the Friday-Saturday exception in that order', () => {
    expect(formatWeekendDays('EG')).toBe('Friday and Saturday');
    expect(formatWeekendDays('SA')).toBe('Friday and Saturday');
  });

  it('formats a single weekend day with no conjunction', () => {
    expect(formatWeekendDays('IR')).toBe('Friday');
    expect(formatWeekendDays('NP')).toBe('Saturday');
  });
});
