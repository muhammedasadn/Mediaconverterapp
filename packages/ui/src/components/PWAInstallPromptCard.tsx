'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, CheckCircle, WifiOff, X } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export function PWAInstallPromptCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isEngineCached, setIsEngineCached] = useState(true);
  const { triggerHaptic } = useHapticFeedback();

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    triggerHaptic('medium');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('On iOS: Tap the Share button in Safari, then tap "Add to Home Screen" to install.');
    }
  };

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springTokens.snappy}
      className="relative overflow-hidden rounded-[28px] border border-cyan-400/30 bg-gradient-to-r from-blue-900/30 via-neutral-900/50 to-cyan-900/20 p-5 sm:p-6 backdrop-blur-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-md">
          <Smartphone className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-white">Install Universal Converter PWA</h4>
            {isEngineCached && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold">
                <WifiOff className="h-3 w-3" />
                Offline Ready
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
            Install on your phone or desktop for instant zero-load startup and offline video & audio conversions.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <CupertinoButton variant="primary" size="sm" onClick={handleInstall} leftIcon={<Download className="h-4 w-4" />}>
          Install App
        </CupertinoButton>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-2 rounded-xl text-neutral-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
