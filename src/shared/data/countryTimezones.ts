import { getCountry } from 'countries-and-timezones';










const PRIMARY_TIMEZONE_OVERRIDES: Record<string, string> = {
  US: 'America/New_York',
  CA: 'America/Toronto',
  RU: 'Europe/Moscow',
  AU: 'Australia/Sydney',
  BR: 'America/Sao_Paulo',
  ID: 'Asia/Jakarta',
  MX: 'America/Mexico_City',
  CD: 'Africa/Kinshasa',
  KZ: 'Asia/Almaty',
  MN: 'Asia/Ulaanbaatar',
  EC: 'America/Guayaquil',
  CL: 'America/Santiago',
  PT: 'Europe/Lisbon',
  ES: 'Europe/Madrid',
  GL: 'America/Nuuk',
  NZ: 'Pacific/Auckland',
  UA: 'Europe/Kyiv',
  PF: 'Pacific/Tahiti',
};

export function getPrimaryTimezone(countryCode: string | null | undefined): string | undefined {
  if (!countryCode) return undefined;
  const code = countryCode.toUpperCase();
  if (PRIMARY_TIMEZONE_OVERRIDES[code]) return PRIMARY_TIMEZONE_OVERRIDES[code];
  return getCountry(code)?.timezones[0];
}





export const REFERENCE_TIMEZONE = 'Africa/Tunis';
