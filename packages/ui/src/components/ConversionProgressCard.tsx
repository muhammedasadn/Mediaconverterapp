'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, XCircle, Zap, ShieldCheck } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { CupertinoButton } from './CupertinoButton';

export interface ConversionProgressCardProps {
  progressPercent: number;
  stage?: string;
  etaSeconds?: number;
  engineUsed: 'device' | 'cloud';
  filename: string;
  onCancel: () => void;
  className?: string;
}

export function ConversionProgressCard({
  progressPercent,
  stage = 'Transcoding stream...',
  etaSeconds,
  engineUsed,
  filename,
  onCancel,
  className = '',
}: ConversionProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springTokens.snappy}
      className={`relative overflow-hidden rounded-[28px] border border-white/20 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                engineUsed === 'device'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              }`}
            >
              {engineUsed === 'device' ? <ShieldCheck className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              {engineUsed === 'device' ? 'On-Device Wasm' : 'Cloud Turbo'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {etaSeconds ? `ETA: ~${Math.ceil(etaSeconds)}s` : 'Real-time encoding'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white truncate max-w-sm">{filename}</h3>
        </div>

        <CupertinoButton variant="ghost" size="sm" onClick={onCancel} leftIcon={<XCircle className="h-4 w-4 text-red-400" />}>
          Cancel
        </CupertinoButton>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-cyan-400 font-semibold">{stage}</span>
          <span className="text-white font-bold">{Math.round(progressPercent)}%</span>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 p-[1px]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-md shadow-cyan-500/50"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />
        </div>
      </div>

      {/* Animated Waveform Visualization */}
      <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2 rounded-2xl bg-black/40 border border-white/5">
        {[40, 70, 30, 90, 60, 45, 80, 100, 50, 75, 35, 85, 60, 40, 95].map((h, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-cyan-400/80"
            animate={{
              height: [`${h * 0.2}%`, `${h}%`, `${h * 0.4}%`],
            }}
            transition={{
              repeat: Infinity,
              duration: 1 + (i % 5) * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
