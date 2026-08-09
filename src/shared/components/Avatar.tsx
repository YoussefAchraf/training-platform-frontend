import { cn } from '@/shared/utils/cn';
import styles from './Avatar.module.css';

interface AvatarProps {
  firstname: string;
  lastname: string;
  size?: number;
  className?: string;
}

function colorIndexFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % 5;
}

export function Avatar({ firstname, lastname, size = 40, className }: AvatarProps) {
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  const colorIndex = colorIndexFromString(`${firstname}${lastname}`);

  return (
    <span
      className={cn(styles.avatar, styles[`tone${colorIndex}`], className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
