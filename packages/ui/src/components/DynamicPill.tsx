'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { springTokens } from '../motion/tokens';
import { Check, ShieldCheck, Cloud, Cpu, AlertCircle } from 'lucide-react';

export interface DynamicPillProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  engine?: 'device' | 'cloud' | 'auto';
  label?: string;
  progressPercent?: number;
  className?: string;
}

export function DynamicPill({
  status,
  engine = 'device',
  label,
  progressPercent,
  className = '',
}: DynamicPillProps) {
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="h-3.5 w-3.5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
      case 'processing':
        return (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
        );
      case 'idle':
      default:
        return engine === 'cloud' ? (
          <Cloud className="h-3.5 w-3.5 text-blue-400" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        );
    }
  };

  const getDefaultLabel = () => {
    if (label) return label;
    if (status === 'processing') {
      return progressPercent !== undefined ? `Processing ${Math.round(progressPercent)}%` : 'Encoding...';
    }
    if (status === 'success') return 'Complete';
    if (status === 'error') return 'Conversion Error';
    return engine === 'cloud' ? 'Cloud Turbo' : 'Device Ready · 100% Private';
  };

  return (
    <motion.div
      layout
      transition={springTokens.snappy}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-2xl text-xs font-medium text-neutral-200 shadow-xl shadow-black/40 select-none ${className}`}
    >
      <span className="shrink-0 flex items-center justify-center">{getIcon()}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${status}-${label}-${progressPercent}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="truncate"
        >
          {getDefaultLabel()}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
