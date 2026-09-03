import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  
  onChange?: (stars: number) => void;
  label?: string;
}


export function StarRating({ value, max = 5, size = 28, onChange, label }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isInteractive = Boolean(onChange);
  const displayValue = hovered ?? value;
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  if (!isInteractive) {
    return (
      <div className={styles.readOnly} aria-label={label} role="img">
        {stars.map((star) => (
          <Star
            key={star}
            size={size}
            className={cn(styles.star, star <= Math.round(value) && styles.starFilled)}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.group} role="radiogroup" aria-label={label} onMouseLeave={() => setHovered(null)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={String(star)}
          className={styles.button}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(null)}
          onClick={() => onChange?.(star)}
        >
          <Star
            size={size}
            className={cn(styles.star, star <= displayValue && styles.starFilled)}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
