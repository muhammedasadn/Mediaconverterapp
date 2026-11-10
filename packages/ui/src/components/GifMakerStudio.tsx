'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Film, Image as ImageIcon, Check } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface GifSettings {
  fps: number;
  width: number;
  quality: 'standard' | 'high' | 'ultra';
  loop: boolean;
}

export interface GifMakerStudioProps {
  mediaSrc: string;
  onGenerateGif: (settings: GifSettings) => void;
  className?: string;
}

export function GifMakerStudio({
  mediaSrc,
  onGenerateGif,
  className = '',
}: GifMakerStudioProps) {
  const { triggerHaptic } = useHapticFeedback();
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [loop, setLoop] = useState(true);

  return (
    <div className={`p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">GIF Maker Studio</h3>
            <p className="text-xs text-neutral-400">High-fidelity 256-color palette-generated looping GIFs.</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 font-bold">
          Lanczos + PaletteGen
        </span>
      </div>

      {/* Looping Video Preview */}
      <div className="relative aspect-video max-h-64 w-full mx-auto overflow-hidden rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
        <video src={mediaSrc} className="h-full w-full object-contain" autoPlay loop muted playsInline />
        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
          Looping Preview ({width}px @ {fps}fps)
        </span>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Frame Rate */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-400 font-semibold">Frame Rate (FPS)</label>
          <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            {[10, 15, 24, 30].map((f) => (
              <button
                key={f}
                onClick={() => {
                  triggerHaptic('light');
                  setFps(f);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-mono transition-colors ${
                  fps === f ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Width Scale */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-400 font-semibold">Width Resolution</label>
          <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            {[320, 480, 640].map((w) => (
              <button
                key={w}
                onClick={() => {
                  triggerHaptic('light');
                  setWidth(w);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-mono transition-colors ${
                  width === w ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {w}p
              </button>
            ))}
          </div>
        </div>

        {/* PaletteGen Quality */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-400 font-semibold">Palette Dithering</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="standard">Standard (Fast)</option>
            <option value="high">High (Floyd-Steinberg)</option>
            <option value="ultra">Ultra (Bayer Matrix)</option>
          </select>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-2 flex justify-end">
        <CupertinoButton
          variant="primary"
          size="md"
          onClick={() => onGenerateGif({ fps, width, quality, loop })}
          leftIcon={<Sparkles className="h-4 w-4" />}
        >
          Render Animated GIF
        </CupertinoButton>
      </div>
    </div>
  );
}
