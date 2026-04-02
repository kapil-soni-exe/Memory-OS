export const fadeInUp = {
  initial: { opacity: 0, y: 8 }, // Reduced from 20 for "Liquid" feel
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } // Quintic ease-out
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    }
  }
};

export const liquidSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 35, // High damping for zero overshoot
  mass: 1
};

export const itemRevealer = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const pageTransition = {
  initial: { opacity: 0, scale: 0.99 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.99 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
};

export const springHover = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 500, damping: 25 }
};

export const microSpring = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 600, damping: 30 }
};
