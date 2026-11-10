'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Zap, Send, Mail, MessageCircle } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface TargetSizeCompressorProps {
  originalSizeBytes: number;
  durationSeconds?: number;
  targetSizeBytes: number;
  onChangeTargetSize: (bytes: number) => void;
  className?: string;
}

export function TargetSizeCompressor({
  originalSizeBytes,
  durationSeconds = 60,
  targetSizeBytes,
  onChangeTargetSize,
  className = '',
}: TargetSizeCompressorProps) {
  const { triggerHaptic } = useHapticFeedback();

  const presets = [
    { label: 'Discord', targetMb: 25, icon: MessageCircle },
    { label: 'WhatsApp', targetMb: 16, icon: Send },
    { label: 'Email', targetMb: 10, icon: Mail },
    { label: 'Ultra (5MB)', targetMb: 5, icon: Zap },
  ];

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const compressionPercent = Math.max(
    0,
    Math.round(((originalSizeBytes - targetSizeBytes) / originalSizeBytes) * 100)
  );

  const isAlreadySmaller = originalSizeBytes > 0 && originalSizeBytes <= targetSizeBytes;

  // Compute calculated video bitrate with 5% container overhead safety buffer
  const safeTargetBytes = targetSizeBytes * 0.95;
  const calculatedBitrateKbps = Math.max(
    64,
    Math.round((safeTargetBytes * 8) / (Math.max(1, durationSeconds) * 1000) - 128)
  );

  return (
    <div className={`p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Minimize2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Target-Size Compressor</h3>
            <p className="text-[11px] text-neutral-400">Set target output size; encoder computes optimal bitrate automatically.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-neutral-400">Reduction:</span>
          <div className="text-sm font-bold text-emerald-400 font-mono">-{compressionPercent}%</div>
        </div>
      </div>

      {/* Preset Target Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const presetBytes = p.targetMb * 1024 * 1024;
          const isSelected = Math.abs(targetSizeBytes - presetBytes) < 1024 * 1024;
          const Icon = p.icon;

          return (
            <motion.button
              key={p.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('light');
                onChangeTargetSize(presetBytes);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] border-white/10 text-neutral-300 hover:bg-white/[0.08]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{p.label}</span>
              <span className="text-[10px] text-neutral-400 font-mono">({p.targetMb}MB)</span>
            </motion.button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-neutral-400">Target Output Size:</span>
          <span className="text-cyan-400 font-bold">{formatBytes(targetSizeBytes)} (Estimated)</span>
        </div>
        <input
          type="range"
          min={1024 * 1024 * 2} // 2MB min
          max={originalSizeBytes}
          step={1024 * 1024 * 0.5} // 0.5MB step
          value={targetSizeBytes}
          onChange={(e) => onChangeTargetSize(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-neutral-500">
          <span>2 MB</span>
          <span>Original: {formatBytes(originalSizeBytes)}</span>
        </div>
      </div>

      {/* Bitrate Telemetry & Container Margin Notice */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-neutral-400">
          <span>Calculated Target Video Bitrate:</span>
          <span className="font-semibold text-white">{calculatedBitrateKbps} kbps</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
          <span>Includes 5% safety margin for MP4 container metadata</span>
          <span>Dual-pass capable</span>
        </div>
      </div>

      {isAlreadySmaller && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>Source file is already smaller than the chosen target. Re-encoding is not recommended to avoid generation loss.</span>
        </div>
      )}
    </div>
  );
}
