import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';
import { CountryFlag } from './CountryFlag';
import { COUNTRY_CODES } from '@/shared/data/countries';
import type { CountryCode } from 'libphonenumber-js';

interface CountrySelectProps {
  value: string;
  onChange: (code: CountryCode | '') => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
  'aria-describedby'?: string;
}








export function CountrySelect({ value, onChange, id, invalid, placeholder, ...rest }: CountrySelectProps) {
  const { t, i18n } = useTranslation('countries');
  const [query, setQuery] = useState<string | null>(null);

  const options = useMemo<ComboboxOption[]>(() => {
    const collator = new Intl.Collator(i18n.language);
    return COUNTRY_CODES.map((code) => ({
      value: code,
      label: t(code),
      icon: <CountryFlag code={code} />,
    })).sort((a, b) => collator.compare(a.label, b.label));
  }, [t, i18n.language]);

  const resolvedName = value ? t(value) : '';
  const displayValue = query ?? resolvedName;

  return (
    <Combobox
      id={id}
      invalid={invalid}
      placeholder={placeholder}
      options={options}
      value={displayValue}
      onChange={(event) => setQuery(event.target.value)}
      onSelect={(code) => {
        onChange(code as CountryCode);
        setQuery(null);
      }}
      onBlur={() => setQuery(null)}
      {...rest}
    />
  );
}
