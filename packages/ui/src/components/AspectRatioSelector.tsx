'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Square, RectangleVertical } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface AspectRatioOption {
  id: AspectRatio;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  className?: string;
}

export function AspectRatioSelector({
  value,
  onChange,
  className = '',
}: AspectRatioSelectorProps) {
  const { triggerHaptic } = useHapticFeedback();

  const options: AspectRatioOption[] = [
    { id: '16:9', label: '16:9 Landscape', sublabel: 'YouTube / Desktop', icon: <Monitor className="h-4 w-4" /> },
    { id: '9:16', label: '9:16 Vertical', sublabel: 'TikTok / Reels / Shorts', icon: <Smartphone className="h-4 w-4" /> },
    { id: '1:1', label: '1:1 Square', sublabel: 'Instagram / Feed', icon: <Square className="h-4 w-4" /> },
    { id: '4:5', label: '4:5 Portrait', sublabel: 'Social Portrait', icon: <RectangleVertical className="h-4 w-4" /> },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-semibold text-neutral-400">Video Canvas Aspect Ratio</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                triggerHaptic('light');
                onChange(opt.id);
              }}
              className={`relative p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-aspect-ratio"
                  transition={springTokens.snappy}
                  className="absolute inset-0 border-2 border-cyan-400 rounded-2xl pointer-events-none"
                />
              )}

              <div className="flex items-center gap-2 mb-1">
                <span className={isSelected ? 'text-cyan-400' : 'text-neutral-400'}>{opt.icon}</span>
                <span className="text-xs font-bold text-white">{opt.id}</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">{opt.sublabel}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
