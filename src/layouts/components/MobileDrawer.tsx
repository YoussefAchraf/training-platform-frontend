import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { GraduationCap, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUiStore } from '@/shared/store/uiStore';
import { cn } from '@/shared/utils/cn';
import { easeOut } from '@/shared/motion/variants';
import { usePrefetchRoute } from '@/routes/routeModules';
import { visibleNavItems } from './navItems';
import styles from './MobileDrawer.module.css';

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const drawerVariants: Variants = {
  hidden: { x: '-100%' },
  show: { x: 0, transition: { type: 'spring', damping: 32, stiffness: 320 } },
  exit: { x: '-100%', transition: { duration: 0.22, ease: easeOut } },
};

export function MobileDrawer() {
  const { user } = useAuth();
  const isOpen = useUiStore((state) => state.isDrawerOpen);
  const closeDrawer = useUiStore((state) => state.closeDrawer);
  const items = visibleNavItems(user?.role);
  const shouldReduceMotion = useReducedMotion();
  const prefetchRoute = usePrefetchRoute();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={closeDrawer}
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div
            className={styles.drawer}
            onClick={(event) => event.stopPropagation()}
            variants={shouldReduceMotion ? overlayVariants : drawerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className={styles.header}>
              <div className={styles.brand}>
                <span className={styles.brandMark}>
                  <GraduationCap size={18} />
                </span>
                <span>Training Platform</span>
              </div>
              <button type="button" className={styles.closeButton} onClick={closeDrawer} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <nav className={styles.nav} aria-label="Main navigation">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  onTouchStart={() => prefetchRoute(item.to)}
                  className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="drawer-active-pill"
                          className={styles.activePill}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={styles.navContent}>
                        <item.icon size={19} />
                        <span>{item.label}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
