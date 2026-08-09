import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { easeOut } from '@/shared/motion/variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Avatar } from '@/shared/components/Avatar';
import { Badge } from '@/shared/components/Badge';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { roleMeta } from '@/shared/utils/statusMeta';
import { cn } from '@/shared/utils/cn';
import { paths } from '@/routes/paths';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  placement?: 'up' | 'down';
  variant?: 'full' | 'compact';
  
  align?: 'left' | 'right';
}

function panelVariants(placement: 'up' | 'down'): Variants {
  const offset = placement === 'up' ? 6 : -6;
  return {
    hidden: { opacity: 0, scale: 0.96, y: offset },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: easeOut } },
    exit: { opacity: 0, scale: 0.97, y: offset, transition: { duration: 0.12, ease: easeOut } },
  };
}

export function UserMenu({ placement = 'down', variant = 'full', align = 'right' }: UserMenuProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { isOpen, toggle, close } = useDisclosure(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, close, isOpen);

  if (!user) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate(paths.login, { replace: true }),
    });
  };

  return (
    <div className={cn(styles.wrapper, variant === 'compact' && styles.wrapperCompact)} ref={ref}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              styles.panel,
              placement === 'up' ? styles.panelUp : styles.panelDown,
              variant === 'compact' && styles.panelCompact,
              variant === 'compact' && align === 'left' && styles.panelCompactLeft,
            )}
            variants={panelVariants(placement)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className={styles.panelHeader}>
              <Avatar firstname={user.firstname} lastname={user.lastname} size={36} />
              <div className={styles.panelInfo}>
                <p className={styles.panelName}>
                  {user.firstname} {user.lastname}
                </p>
                <p className={styles.panelEmail}>{user.email}</p>
              </div>
            </div>
            <Badge tone={roleMeta[user.role].tone}>{roleMeta[user.role].label}</Badge>

            <ThemeToggle />

            <Link to={paths.account} className={styles.menuLink} onClick={close}>
              <Settings size={16} />
              <span>Account settings</span>
            </Link>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {variant === 'compact' ? (
        <button type="button" className={styles.compactTrigger} onClick={toggle} aria-expanded={isOpen} aria-label="Account menu">
          <Avatar firstname={user.firstname} lastname={user.lastname} size={36} />
        </button>
      ) : (
        <button type="button" className={styles.trigger} onClick={toggle} aria-expanded={isOpen}>
          <Avatar firstname={user.firstname} lastname={user.lastname} size={34} />
          <span className={styles.triggerInfo}>
            <span className={styles.triggerName}>
              {user.firstname} {user.lastname}
            </span>
            <span className={styles.triggerRole}>{user.role}</span>
          </span>
          <ChevronsUpDown size={16} className={styles.chevron} />
        </button>
      )}
    </div>
  );
}
