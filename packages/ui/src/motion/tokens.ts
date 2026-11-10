export const springTokens = {
  // Snappy: Buttons, segmented pills, micro-interactions
  snappy: { type: 'spring' as const, stiffness: 420, damping: 30, mass: 0.8 },
  // Gentle: Bottom sheets, modal dialogs, page transitions
  gentle: { type: 'spring' as const, stiffness: 240, damping: 26, mass: 1 },
  // Bouncy: Checkmark draw, celebrations, playful badges
  bouncy: { type: 'spring' as const, stiffness: 360, damping: 18, mass: 1 },
  // Micro: Hover scales and tactile tap feedback
  micro: { type: 'spring' as const, stiffness: 500, damping: 35, mass: 0.5 },
};

export const durationTokens = {
  instant: 0.12,
  fast: 0.2,
  standard: 0.32,
  cinematic: 0.5,
  hero: 1.2,
};
