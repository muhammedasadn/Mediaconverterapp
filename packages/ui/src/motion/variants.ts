import { Variants } from 'framer-motion';
import { springTokens } from './tokens';

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTokens.snappy,
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTokens.snappy,
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
};

export const sheetVariant: Variants = {
  hidden: { y: '100%', opacity: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springTokens.gentle,
  },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};
