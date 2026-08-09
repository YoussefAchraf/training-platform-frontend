import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { pageTransition } from '@/shared/motion/variants';

export function PageTransition() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={shouldReduceMotion ? undefined : pageTransition}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
