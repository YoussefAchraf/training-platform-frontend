import { describe, expect, it } from 'vitest';
import { zonedTimeToUtcIso, formatDateTimeInZone, formatFullDateTimeInZone, utcIsoToZonedParts } from './timezoneConversion';

describe('zonedTimeToUtcIso', () => {
  it('converts a Tunisia (fixed UTC+1, no DST) time to UTC correctly in winter', () => {
    expect(zonedTimeToUtcIso('2026-01-15', '09:00', 'Africa/Tunis')).toBe('2026-01-15T08:00:00.000Z');
  });

  it('converts a Tunisia time to UTC identically in summer - Tunisia never observes DST', () => {
    expect(zonedTimeToUtcIso('2026-07-15', '09:00', 'Africa/Tunis')).toBe('2026-07-15T08:00:00.000Z');
  });

  it('converts a France (DST-observing) time to UTC using the winter offset (UTC+1)', () => {
    expect(zonedTimeToUtcIso('2026-01-15', '09:00', 'Europe/Paris')).toBe('2026-01-15T08:00:00.000Z');
  });

  it('converts a France time to UTC using the summer offset (UTC+2) - one hour different from winter', () => {
    expect(zonedTimeToUtcIso('2026-07-15', '09:00', 'Europe/Paris')).toBe('2026-07-15T07:00:00.000Z');
  });

  it('matches Tunisia exactly in winter, when both are UTC+1 - the same real-world moment', () => {
    const parisWinter = zonedTimeToUtcIso('2026-01-15', '09:00', 'Europe/Paris');
    const tunisWinter = zonedTimeToUtcIso('2026-01-15', '09:00', 'Africa/Tunis');
    expect(parisWinter).toBe(tunisWinter);
  });

  it('is one hour apart from Tunisia in summer, when France springs forward but Tunisia does not', () => {
    const parisSummer = new Date(zonedTimeToUtcIso('2026-07-15', '09:00', 'Europe/Paris')!);
    const tunisSummer = new Date(zonedTimeToUtcIso('2026-07-15', '09:00', 'Africa/Tunis')!);
    expect(parisSummer.getTime() - tunisSummer.getTime()).toBe(-60 * 60 * 1000);
  });

  it('handles a large positive offset that pushes the UTC date to the previous day', () => {
    
    expect(zonedTimeToUtcIso('2026-01-15', '09:00', 'Asia/Tokyo')).toBe('2026-01-15T00:00:00.000Z');
    
    expect(zonedTimeToUtcIso('2026-01-15', '06:00', 'Asia/Tokyo')).toBe('2026-01-14T21:00:00.000Z');
  });

  it('returns null for missing inputs', () => {
    expect(zonedTimeToUtcIso('', '09:00', 'Africa/Tunis')).toBeNull();
    expect(zonedTimeToUtcIso('2026-01-15', '', 'Africa/Tunis')).toBeNull();
  });
});

describe('formatDateTimeInZone', () => {
  it('formats a UTC instant back into the expected local wall-clock time', () => {
    const formatted = formatDateTimeInZone('2026-01-15T08:00:00.000Z', 'Africa/Tunis');
    expect(formatted).toContain('9:00');
  });

  it('round-trips: converting to UTC then formatting back in the same zone reproduces the original time', () => {
    const utcIso = zonedTimeToUtcIso('2026-07-15', '14:30', 'Europe/Paris')!;
    const formatted = formatDateTimeInZone(utcIso, 'Europe/Paris');
    expect(formatted).toContain('2:30');
  });

  it('returns an em dash for an invalid instant', () => {
    expect(formatDateTimeInZone('not-a-date', 'Africa/Tunis')).toBe('—');
  });
});

describe('formatFullDateTimeInZone', () => {
  it('includes the full calendar date alongside the time, unlike formatDateTimeInZone', () => {
    const formatted = formatFullDateTimeInZone('2026-09-15T07:00:00.000Z', 'Europe/Paris');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('9:00');
  });

  it('reflects the DST offset actually in effect for the given zone and date', () => {
    const winter = formatFullDateTimeInZone('2026-01-15T08:00:00.000Z', 'Europe/Paris');
    const summer = formatFullDateTimeInZone('2026-07-15T07:00:00.000Z', 'Europe/Paris');
    expect(winter).toContain('9:00');
    expect(summer).toContain('9:00');
  });

  it('returns an em dash for an invalid instant', () => {
    expect(formatFullDateTimeInZone('not-a-date', 'Africa/Tunis')).toBe('—');
  });
});

describe('utcIsoToZonedParts', () => {
  it('splits a UTC instant into the client zone\'s own date and time, not the host machine\'s', () => {
    expect(utcIsoToZonedParts('2026-01-15T08:00:00.000Z', 'Africa/Tunis')).toEqual({ date: '2026-01-15', time: '09:00' });
  });

  it('is the exact inverse of zonedTimeToUtcIso for a DST-observing zone in summer', () => {
    const utcIso = zonedTimeToUtcIso('2026-07-15', '14:30', 'Europe/Paris')!;
    expect(utcIsoToZonedParts(utcIso, 'Europe/Paris')).toEqual({ date: '2026-07-15', time: '14:30' });
  });

  it('rolls the date forward across midnight for a large positive offset', () => {
    
    
    expect(utcIsoToZonedParts('2026-01-14T21:00:00.000Z', 'Asia/Tokyo')).toEqual({ date: '2026-01-15', time: '06:00' });
  });

  it('returns empty strings for an invalid instant', () => {
    expect(utcIsoToZonedParts('not-a-date', 'Africa/Tunis')).toEqual({ date: '', time: '' });
  });
});
