import { UserMenu } from '@/layouts/components/UserMenu';
import styles from './PwaHeader.module.css';

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });




export function PwaHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.date}>{WEEKDAY_FORMATTER.format(new Date())}</span>
      <UserMenu placement="down" variant="compact" />
    </header>
  );
}
