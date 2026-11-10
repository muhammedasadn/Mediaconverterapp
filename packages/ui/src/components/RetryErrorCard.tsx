'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Cloud, RotateCcw, Sliders } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { CupertinoButton } from './CupertinoButton';
import { useHapticFeedback } from '../motion/hooks';

export interface RetryErrorCardProps {
  errorMessage: string;
  suggestCloud?: boolean;
  onRetryCloud?: () => void;
  onModifySettings: () => void;
  className?: string;
}

export function RetryErrorCard({
  errorMessage,
  suggestCloud = true,
  onRetryCloud,
  onModifySettings,
  className = '',
}: RetryErrorCardProps) {
  const { triggerHaptic } = useHapticFeedback();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: [-6, 6, -4, 4, -2, 2, 0], // Gentle shake feedback
      }}
      transition={springTokens.snappy}
      className={`relative overflow-hidden rounded-[28px] border border-red-500/30 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-3xl text-center shadow-2xl ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px 0 rgba(255, 69, 58, 0.2), 0 24px 48px -12px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Conversion Interrupted</h3>
      <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
        {errorMessage || 'Your browser encountered memory constraints while processing this stream.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {suggestCloud && onRetryCloud && (
          <CupertinoButton
            variant="primary"
            size="md"
            onClick={() => {
              triggerHaptic('medium');
              onRetryCloud();
            }}
            leftIcon={<Cloud className="h-4 w-4" />}
          >
            Retry with Cloud Turbo
          </CupertinoButton>
        )}

        <CupertinoButton
          variant="secondary"
          size="md"
          onClick={() => {
            triggerHaptic('light');
            onModifySettings();
          }}
          leftIcon={<Sliders className="h-4 w-4" />}
        >
          Change Settings
        </CupertinoButton>
      </div>
    </motion.div>
  );
}
