import { Menu } from 'lucide-react';
import { useUiStore } from '@/shared/store/uiStore';
import { UserMenu } from './UserMenu';
import styles from './Topbar.module.css';

export function Topbar() {
  const openDrawer = useUiStore((state) => state.openDrawer);

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={openDrawer}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>
      <span className={styles.brandName}>Training Platform</span>
      <UserMenu placement="down" variant="compact" />
    </header>
  );
}
