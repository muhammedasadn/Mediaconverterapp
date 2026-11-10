'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EngineMode } from '@universal/job-contracts';
import { ShieldCheck, Cloud, Cpu, Info } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface EngineSelectorProps {
  engineMode: EngineMode;
  resolvedEngine: 'device' | 'cloud';
  reason: string;
  onChange: (mode: EngineMode) => void;
  className?: string;
}

export function EngineSelector({
  engineMode,
  resolvedEngine,
  reason,
  onChange,
  className = '',
}: EngineSelectorProps) {
  const { triggerHaptic } = useHapticFeedback();

  const modes: { id: EngineMode; label: string; icon: React.ReactNode }[] = [
    { id: 'auto', label: 'Smart Hybrid', icon: <Cpu className="h-3.5 w-3.5" /> },
    { id: 'device', label: 'Device (Private)', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> },
    { id: 'cloud', label: 'Cloud Turbo', icon: <Cloud className="h-3.5 w-3.5 text-blue-400" /> },
  ];

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">Execution Engine:</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              resolvedEngine === 'device'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
            }`}
          >
            {resolvedEngine === 'device' ? '🔒 100% On-Device Wasm' : '⚡ Cloud Turbo Cluster'}
          </span>
        </div>

        {/* Engine Toggle Buttons */}
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
          {modes.map((m) => {
            const isSelected = engineMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  triggerHaptic('light');
                  onChange(m.id);
                }}
                className={`relative px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                  isSelected ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-engine-mode"
                    transition={springTokens.snappy}
                    className="absolute inset-0 bg-white/15 border border-white/20 rounded-lg shadow-sm"
                  />
                )}
                <span className="relative z-10">{m.icon}</span>
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transparent Explanation */}
      <div className="flex items-start gap-2 pt-1 text-[11px] text-neutral-400">
        <Info className="h-3.5 w-3.5 shrink-0 text-cyan-400 mt-0.5" />
        <p className="leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
