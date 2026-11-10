'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { FormatDefinition } from '@universal/format-registry';
import { ALL_FORMATS } from '@universal/format-registry';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';
import { Film, Music, Image as ImageIcon, Sparkles } from 'lucide-react';

export interface FormatSelectorProps {
  selectedFormatId: string;
  onSelectFormat: (format: FormatDefinition) => void;
  className?: string;
}

export function FormatSelector({
  selectedFormatId,
  onSelectFormat,
  className = '',
}: FormatSelectorProps) {
  const { triggerHaptic } = useHapticFeedback();
  const [activeCategory, setActiveCategory] = useState<'video' | 'audio'>('video');

  const categories = [
    { id: 'video', label: 'Video Containers', icon: Film },
    { id: 'audio', label: 'Audio Tracks', icon: Music },
  ] as const;

  const currentFormats: FormatDefinition[] = (Object.values(ALL_FORMATS) as FormatDefinition[]).filter(
    (f) => f.category === activeCategory
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Target Format</span>
        </h4>

        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.06] border border-white/10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveCategory(cat.id);
                }}
                className={`relative px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  isSelected ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="category-tab-pill"
                    transition={springTokens.snappy}
                    className="absolute inset-0 bg-white/15 border border-white/20 rounded-lg shadow-sm"
                  />
                )}
                <Icon className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {currentFormats.map((fmt) => {
          const isSelected = fmt.id === selectedFormatId;

          return (
            <motion.button
              key={fmt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springTokens.snappy}
              onClick={() => {
                triggerHaptic('medium');
                onSelectFormat(fmt);
              }}
              className={`relative overflow-hidden p-3 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-500/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-format-pill"
                  transition={springTokens.snappy}
                  className="absolute inset-0 border-2 border-cyan-400 rounded-2xl pointer-events-none"
                />
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-bold text-white uppercase">
                  {fmt.extension}
                </span>
                {fmt.isRecommended && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-semibold">
                    <Sparkles className="h-2.5 w-2.5" />
                    Auto
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 line-clamp-1">
                {fmt.name}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
