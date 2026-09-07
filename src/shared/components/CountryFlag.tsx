import { cn } from '@/shared/utils/cn';
import styles from './CountryFlag.module.css';

interface CountryFlagProps {
  
  code: string | null | undefined;
  
  title?: string;
  className?: string;
}





export function CountryFlag({ code, title, className }: CountryFlagProps) {
  if (!code) return null;
  return (
    <span
      className={cn('fi', `fi-${code.toLowerCase()}`, styles.flag, className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
