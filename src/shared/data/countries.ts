import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';





export const COUNTRY_CODES: CountryCode[] = getCountries();

export function countryCallingCode(code: CountryCode): string {
  return `+${getCountryCallingCode(code)}`;
}
