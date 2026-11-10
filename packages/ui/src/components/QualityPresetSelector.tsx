'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { QualityPreset } from '@universal/format-registry';
import { QUALITY_PRESETS } from '@universal/format-registry';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';
import { Sparkles, Zap, HardDrive, ShieldCheck } from 'lucide-react';

export interface QualityPresetSelectorProps {
  selectedPreset: QualityPreset;
  onSelectPreset: (preset: QualityPreset) => void;
  inputSizeBytes?: number;
  className?: string;
}

export function QualityPresetSelector({
  selectedPreset,
  onSelectPreset,
  inputSizeBytes = 25 * 1024 * 1024, // default 25MB estimate
  className = '',
}: QualityPresetSelectorProps) {
  const { triggerHaptic } = useHapticFeedback();

  const presets = Object.values(QUALITY_PRESETS) as Array<(typeof QUALITY_PRESETS)[keyof typeof QUALITY_PRESETS]>;

  // Dynamic estimate ratio
  const getEstimatedSize = (preset: QualityPreset) => {
    let ratio = 0.7; // default balanced
    if (preset === 'small') ratio = 0.35;
    if (preset === 'best') ratio = 0.95;
    if (preset === 'lossless') ratio = 1.0;

    const estimatedBytes = inputSizeBytes * ratio;
    const mb = estimatedBytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getIcon = (id: QualityPreset) => {
    switch (id) {
      case 'small':
        return <Zap className="h-4 w-4 text-emerald-400" />;
      case 'balanced':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case 'best':
        return <HardDrive className="h-4 w-4 text-purple-400" />;
      case 'lossless':
        return <ShieldCheck className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">Quality & Size Preset</h4>
        <span className="text-[11px] text-neutral-400 font-mono">
          Est. Size: <strong className="text-cyan-400">{getEstimatedSize(selectedPreset)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {presets.map((p) => {
          const isSelected = p.id === selectedPreset;

          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springTokens.snappy}
              onClick={() => {
                triggerHaptic('light');
                onSelectPreset(p.id);
              }}
              className={`relative p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-preset-glow"
                  transition={springTokens.snappy}
                  className="absolute inset-0 border-2 border-cyan-400 rounded-2xl pointer-events-none"
                />
              )}

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {getIcon(p.id)}
                  <span className="text-xs font-bold text-white">{p.label}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                  {p.badge}
                </span>
              </div>

              <p className="text-[10px] text-neutral-400 line-clamp-1 mt-1">
                ~{getEstimatedSize(p.id)}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
