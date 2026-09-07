import { useTranslation } from 'react-i18next';
import { getWeekendDays } from '@/shared/data/countryWeekends';
import { EmptyState } from '@/shared/components/EmptyState';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { cn } from '@/shared/utils/cn';
import type { Client } from '@/shared/types/domain';
import styles from './ClientWeekendMap.module.css';


const SHORT_DAY: Record<number, string> = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
const DEFAULT_WEEKEND_KEY = [0, 6].sort().join(',');

interface ClientWeekendMapProps {
  clients: Client[];
  emptyText: string;
}






export function ClientWeekendMap({ clients, emptyText }: ClientWeekendMapProps) {
  const { t: tCountry } = useTranslation('countries');

  const byCountry = new Map<string, string[]>();
  for (const client of clients) {
    if (!client.country) continue;
    const names = byCountry.get(client.country) ?? [];
    names.push(client.companyName);
    byCountry.set(client.country, names);
  }

  if (byCountry.size === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <div className={styles.row}>
      {Array.from(byCountry.entries()).map(([country, companyNames]) => {
        const days = getWeekendDays(country);
        const isDefault = [...days].sort().join(',') === DEFAULT_WEEKEND_KEY;
        const label = days.map((day) => SHORT_DAY[day]).join('–');
        return (
          <span
            key={country}
            className={cn(styles.chip, !isDefault && styles.chipAlt)}
            title={`${tCountry(country)} · ${companyNames.join(', ')}`}
          >
            <CountryFlag code={country} className={styles.flag} />
            {label}
          </span>
        );
      })}
    </div>
  );
}
