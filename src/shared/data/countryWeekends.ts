















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

const DEFAULT_WEEKEND = [0, 6]; 

export function getWeekendDays(countryCode: string | null | undefined): number[] {
  if (!countryCode) return DEFAULT_WEEKEND;
  return WEEKEND_OVERRIDES[countryCode.toUpperCase()] ?? DEFAULT_WEEKEND;
}
