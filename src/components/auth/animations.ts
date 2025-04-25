
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export const glowPulse = {
  initial: { boxShadow: '0 0 0 rgba(255,255,255,0)' },
  animate: { boxShadow: '0 0 30px rgba(255,255,255,0.5)' },
  transition: { duration: 2, repeat: Infinity, repeatType: "reverse" as const }
};

export const floatElement = {
  initial: { y: 0 },
  animate: { y: [-10, 10, -10] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
};

export const glitchText = {
  initial: { skewX: 0 },
  animate: { skewX: [-2, 0, 2, 0] },
  transition: { duration: 0.2, repeat: Infinity, repeatDelay: 5 }
};

export const scanLine = {
  initial: { y: -100, opacity: 0 },
  animate: { y: [null, 1000], opacity: [0, 0.5, 0] },
  transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
};

export const particleSystem = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: [0, 1, 0] },
  transition: { duration: 3, repeat: Infinity, repeatType: "loop" as const }
};

export const wavyBorder = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 2, ease: "easeInOut" }
};

export const holographicReveal = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay: 0.2 }
};
