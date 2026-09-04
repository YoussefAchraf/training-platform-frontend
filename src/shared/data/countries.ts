import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';





export const COUNTRY_CODES: CountryCode[] = getCountries();

export function countryCallingCode(code: CountryCode): string {
  return `+${getCountryCallingCode(code)}`;
}

// ISO 3166-1 alpha-2 -> Unicode regional indicator flag emoji (e.g. 'TN' ->
// 🇹🇳). Computed rather than stored per-country - renders natively on every
// platform (including the installed PWA) with no image assets.
export function countryFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
