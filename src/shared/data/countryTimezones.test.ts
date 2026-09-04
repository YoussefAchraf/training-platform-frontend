import { describe, expect, it } from 'vitest';
import { getPrimaryTimezone, REFERENCE_TIMEZONE } from './countryTimezones';

describe('getPrimaryTimezone', () => {
  it('returns undefined when no country is given', () => {
    expect(getPrimaryTimezone(undefined)).toBeUndefined();
    expect(getPrimaryTimezone(null)).toBeUndefined();
    expect(getPrimaryTimezone('')).toBeUndefined();
  });

  it('resolves a single-timezone country directly from the package data', () => {
    expect(getPrimaryTimezone('TN')).toBe('Africa/Tunis');
    expect(getPrimaryTimezone('FR')).toBe('Europe/Paris');
  });

  it('uses the curated override for a multi-timezone country instead of an arbitrary first zone', () => {
    expect(getPrimaryTimezone('US')).toBe('America/New_York');
    expect(getPrimaryTimezone('RU')).toBe('Europe/Moscow');
  });

  it('is case-insensitive', () => {
    expect(getPrimaryTimezone('tn')).toBe('Africa/Tunis');
  });

  it('returns undefined for an unrecognized code', () => {
    expect(getPrimaryTimezone('ZZ')).toBeUndefined();
  });
});

describe('REFERENCE_TIMEZONE', () => {
  it('is the company reference zone, Tunisia', () => {
    expect(REFERENCE_TIMEZONE).toBe('Africa/Tunis');
  });
});
