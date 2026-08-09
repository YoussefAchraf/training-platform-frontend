import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './ProviderLogo.module.css';

interface ProviderLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}





export function ProviderLogo({ name, logoUrl, size = 40, className }: ProviderLogoProps) {
  const [failed, setFailed] = useState(false);

  
  
  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const showImage = Boolean(logoUrl) && !failed;

  return (
    <span
      className={cn(styles.logo, className)}
      style={{ '--logo-size': `${size}px` } as CSSProperties}
    >
      {showImage ? (
        <img
          key={logoUrl}
          src={logoUrl ?? undefined}
          alt={`${name} logo`}
          className={styles.image}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <Building2 size={size * 0.55} className={styles.placeholderIcon} aria-hidden="true" />
      )}
    </span>
  );
}
