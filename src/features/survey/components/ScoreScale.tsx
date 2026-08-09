import { cn } from '@/shared/utils/cn';
import styles from './ScoreScale.module.css';

interface ScoreScaleProps {
  max: number;
  value: number | undefined;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
}

export function ScoreScale({ max, value, onChange, minLabel, maxLabel }: ScoreScaleProps) {
  const options = Array.from({ length: max + 1 }, (_, index) => index);

  return (
    <div>
      <div className={styles.scale} role="radiogroup">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            className={cn(styles.option, value === option && styles.optionActive)}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className={styles.labels}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
