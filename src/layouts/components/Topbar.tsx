import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/shared/store/uiStore';
import { UserMenu } from './UserMenu';
import styles from './Topbar.module.css';

export function Topbar() {
  const { t } = useTranslation('common');
  const openDrawer = useUiStore((state) => state.openDrawer);

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={openDrawer}
        aria-label={t('Topbar.openMenu')}
      >
        <Menu size={22} />
      </button>
      <span className={styles.brandName}>{t('Nav.brand')}</span>
      <UserMenu placement="down" variant="compact" />
    </header>
  );
}
