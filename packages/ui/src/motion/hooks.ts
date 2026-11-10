'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { useCallback } from 'react';

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

/**
 * Triggers subtle Web Vibration API feedback on supported mobile devices (Android/iOS PWA)
 */
export function useHapticFeedback() {
  const triggerHaptic = useCallback((pattern: 'light' | 'medium' | 'success' | 'error' = 'light') => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    try {
      switch (pattern) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([15, 50, 25]);
          break;
        case 'error':
          navigator.vibrate([40, 60, 40]);
          break;
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }, []);

  return { triggerHaptic };
}
