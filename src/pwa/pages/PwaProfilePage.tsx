import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/shared/components/Avatar';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { usePrefetchRoute } from '@/routes/routeModules';
import { overflowNavItems } from '@/layouts/components/navItems';
import { roleMeta } from '@/shared/utils/statusMeta';
import { paths } from '@/routes/paths';
import styles from './PwaProfilePage.module.css';







export function PwaProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const prefetchRoute = usePrefetchRoute();

  if (!user) return null;

  const overflow = overflowNavItems(user.role);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate(paths.login, { replace: true }),
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.title}>Profile</span>
      </header>

      <Card className={styles.identityCard}>
        <div className={styles.identityRow}>
          <Avatar firstname={user.firstname} lastname={user.lastname} size={52} />
          <div className={styles.identityText}>
            <p className={styles.name}>
              {user.firstname} {user.lastname}
            </p>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
        <Badge tone={roleMeta[user.role].tone}>{roleMeta[user.role].label}</Badge>
      </Card>

      <Card className={styles.themeCard}>
        <p className={styles.sectionLabel}>Theme</p>
        <ThemeToggle />
      </Card>

      <button
        type="button"
        className={styles.menuLink}
        onClick={() => navigate(paths.account)}
        onTouchStart={() => prefetchRoute(paths.account)}
      >
        <Settings size={17} />
        <span>Account settings</span>
        <ArrowRight size={15} className={styles.chevron} />
      </button>

      {overflow.length > 0 && (
        <>
          <p className={styles.sectionLabel}>More</p>
          <Card className={styles.moreCard}>
            {overflow.map((item) => (
              <button
                key={item.to}
                type="button"
                className={styles.menuLink}
                onClick={() => navigate(item.to)}
                onTouchStart={() => prefetchRoute(item.to)}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
                <ArrowRight size={15} className={styles.chevron} />
              </button>
            ))}
          </Card>
        </>
      )}

      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        <LogOut size={16} />
        <span>Log out</span>
      </button>
    </div>
  );
}
