import { currentIntlLocale } from '@/shared/i18n/intlLocale';

















const FRIDAY_SATURDAY = [5, 6];
const FRIDAY_ONLY = [5];
const SATURDAY_ONLY = [6];

const WEEKEND_OVERRIDES: Record<string, number[]> = {
  
  SA: FRIDAY_SATURDAY, 
  QA: FRIDAY_SATURDAY, 
  KW: FRIDAY_SATURDAY, 
  BH: FRIDAY_SATURDAY, 
  OM: FRIDAY_SATURDAY, 
  EG: FRIDAY_SATURDAY, 
  JO: FRIDAY_SATURDAY, 
  IQ: FRIDAY_SATURDAY, 
  SY: FRIDAY_SATURDAY, 
  DZ: FRIDAY_SATURDAY, 
  LY: FRIDAY_SATURDAY, 
  SD: FRIDAY_SATURDAY, 
  IL: FRIDAY_SATURDAY, 
  PS: FRIDAY_SATURDAY, 

  
  IR: FRIDAY_ONLY, 
  NP: SATURDAY_ONLY, 
};





const DEFAULT_WEEKEND = [6, 0];

export function getWeekendDays(countryCode: string | null | undefined): number[] {
  if (!countryCode) return DEFAULT_WEEKEND;
  return WEEKEND_OVERRIDES[countryCode.toUpperCase()] ?? DEFAULT_WEEKEND;
}



const WEEKDAY_REFERENCE_SUNDAY = new Date(2023, 0, 1);





export function formatWeekendDays(countryCode: string | null | undefined): string {
  const locale = currentIntlLocale();
  const names = getWeekendDays(countryCode).map((day) => {
    const date = new Date(WEEKDAY_REFERENCE_SUNDAY);
    date.setDate(date.getDate() + day);
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  });
  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(names);
}
