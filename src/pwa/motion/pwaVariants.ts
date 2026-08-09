import type { Transition, Variants } from 'motion/react';
import { easeOut } from '@/shared/motion/variants';


export const houseSpring: Transition = { type: 'spring', damping: 32, stiffness: 320 };


export const splashMark: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: easeOut } },
};

export const splashText: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export const splashContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const splashExit: Variants = {
  show: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.3, ease: easeOut } },
};
