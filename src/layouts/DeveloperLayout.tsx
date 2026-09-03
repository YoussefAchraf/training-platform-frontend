import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Code2, Inbox, LogOut, Megaphone } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { PageTransition } from '@/shared/components/PageTransition';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import styles from './DeveloperLayout.module.css';


export function DeveloperLayout() {
  const { t } = useTranslation('developer');
  const { user } = useAuth();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(paths.developerLogin);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Code2 size={20} />
          <span>{t('DeveloperLayout.brand')}</span>
        </div>

        <nav className={styles.nav} aria-label={t('DeveloperLayout.navLabel')}>
          <NavLink to={paths.developer} end className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}>
            <Inbox size={16} />
            <span>{t('DeveloperLayout.feedbackNav')}</span>
          </NavLink>
          <NavLink
            to={paths.developerAnnouncements}
            className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
          >
            <Megaphone size={16} />
            <span>{t('DeveloperLayout.announcementsNav')}</span>
          </NavLink>
        </nav>

        <div className={styles.userArea}>
          {user && <span className={styles.userEmail}>{user.email}</span>}
          <button type="button" className={styles.logoutButton} onClick={handleLogout} disabled={logout.isPending}>
            <LogOut size={16} />
            <span>{t('DeveloperLayout.signOut')}</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <PageTransition />
        </div>
      </main>
    </div>
  );
}
