import { describe, expect, it } from 'vitest';
import { getWeekendDays } from './countryWeekends';

describe('getWeekendDays', () => {
  it('defaults to Saturday-Sunday when no country is given', () => {
    expect(getWeekendDays(undefined)).toEqual([0, 6]);
    expect(getWeekendDays(null)).toEqual([0, 6]);
    expect(getWeekendDays('')).toEqual([0, 6]);
  });

  it('defaults to Saturday-Sunday for a country with no documented exception', () => {
    expect(getWeekendDays('FR')).toEqual([0, 6]);
    expect(getWeekendDays('US')).toEqual([0, 6]);
  });

  it('returns Saturday-Sunday for the UAE, which moved off Friday-Saturday in 2022', () => {
    expect(getWeekendDays('AE')).toEqual([0, 6]);
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
