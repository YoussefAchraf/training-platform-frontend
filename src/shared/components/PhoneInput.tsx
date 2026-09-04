import { useMemo, useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { Input } from './Input';
import { countryCallingCode, countryFlagEmoji } from '@/shared/data/countries';
import { cn } from '@/shared/utils/cn';
import styles from './PhoneInput.module.css';

interface PhoneInputProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  'aria-describedby'?: string;
}







export function PhoneInput({ country, value, onChange, onBlur, id, invalid, disabled, placeholder, ...rest }: PhoneInputProps) {
  const [nationalText, setNationalText] = useState<string | null>(null);

  const derivedNational = useMemo(() => {
    if (!country || !value) return '';
    const parsed = parsePhoneNumberFromString(value, country as CountryCode);
    return parsed ? parsed.formatNational() : value;
  }, [country, value]);

  if (!country) {
    return (
      <Input
        id={id}
        type="tel"
        invalid={invalid}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onBlur={onBlur}
        {...rest}
      />
    );
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setNationalText(new AsYouType(country as CountryCode).input(raw));
    const parsed = parsePhoneNumberFromString(raw, country as CountryCode);
    onChange(parsed ? parsed.number : '');
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setNationalText(null);
    onBlur?.(event);
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.prefix}>
        <span aria-hidden="true">{countryFlagEmoji(country)}</span>
        {countryCallingCode(country as CountryCode)}
      </span>
      <input
        id={id}
        type="tel"
        className={cn(styles.input, invalid && styles.invalid)}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        placeholder={placeholder}
        value={nationalText ?? derivedNational}
        onChange={handleChange}
        onBlur={handleBlur}
        {...rest}
      />
    </div>
  );
}
