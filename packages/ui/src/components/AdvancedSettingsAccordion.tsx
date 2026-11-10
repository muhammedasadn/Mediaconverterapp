'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, ChevronDown } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface AdvancedSettingsState {
  resolution?: string;
  fps?: number;
  crf?: number;
  audioBitrateKbps?: number;
  sampleRateHz?: number;
  channels?: number;
}

export interface AdvancedSettingsAccordionProps {
  settings: AdvancedSettingsState;
  onChange: (settings: AdvancedSettingsState) => void;
  className?: string;
}

export function AdvancedSettingsAccordion({
  settings,
  onChange,
  className = '',
}: AdvancedSettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden ${className}`}>
      <button
        onClick={() => {
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between p-4 text-xs font-bold text-neutral-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span>Advanced Codec & Stream Parameters</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={springTokens.snappy}>
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTokens.snappy}
            className="overflow-hidden border-t border-white/10 p-4 space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="text-neutral-400">Resolution Scale</label>
                <select
                  value={settings.resolution || 'original'}
                  onChange={(e) => onChange({ ...settings, resolution: e.target.value })}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="original">Original (Match Source)</option>
                  <option value="1920:1080">1080p FHD (1920×1080)</option>
                  <option value="1280:720">720p HD (1280×720)</option>
                  <option value="854:480">480p SD (854×480)</option>
                </select>
              </div>

              {/* Framerate */}
              <div className="space-y-1.5">
                <label className="text-neutral-400">Framerate (FPS)</label>
                <select
                  value={settings.fps || 0}
                  onChange={(e) => onChange({ ...settings, fps: Number(e.target.value) || undefined })}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={0}>Auto (Match Source)</option>
                  <option value={60}>60 fps (Ultra Smooth)</option>
                  <option value={30}>30 fps (Standard Web)</option>
                  <option value={24}>24 fps (Cinematic)</option>
                </select>
              </div>

              {/* Audio Bitrate */}
              <div className="space-y-1.5">
                <label className="text-neutral-400">Audio Bitrate</label>
                <select
                  value={settings.audioBitrateKbps || 192}
                  onChange={(e) => onChange({ ...settings, audioBitrateKbps: Number(e.target.value) })}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={320}>320 kbps (Studio Quality)</option>
                  <option value={256}>256 kbps (High Fidelity)</option>
                  <option value={192}>192 kbps (Standard)</option>
                  <option value={128}>128 kbps (Compact)</option>
                </select>
              </div>
            </div>

            {/* CRF Slider */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Constant Rate Factor (CRF): {settings.crf ?? 23}</span>
                <span className="text-[10px] text-neutral-500">(0 = Lossless, 23 = Default, 51 = Maximum Compression)</span>
              </div>
              <input
                type="range"
                min="0"
                max="51"
                value={settings.crf ?? 23}
                onChange={(e) => onChange({ ...settings, crf: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
