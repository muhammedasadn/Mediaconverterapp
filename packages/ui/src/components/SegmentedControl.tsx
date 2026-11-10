'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  layoutId = 'segmented-indicator',
  className = '',
}: SegmentedControlProps<T>) {
  const { triggerHaptic } = useHapticFeedback();

  return (
    <div
      role="tablist"
      className={`relative inline-flex items-center p-1 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-2xl select-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => {
              triggerHaptic('light');
              onChange(option.value);
            }}
            className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-colors duration-150 focus:outline-none ${
              isSelected ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={springTokens.snappy}
                className="absolute inset-0 z-[-1] rounded-xl bg-white/15 border border-white/20 shadow-md shadow-black/40 backdrop-blur-lg"
              />
            )}
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge && (
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-neutral-400'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
