'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Music,
  Zap,
  Star,
  Download,
  Scissors,
  Minimize2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  generateVideoQualityOptions,
  generateAudioQualityOptions,
  VideoQualityOption,
  AudioQualityOption,
} from '@universal/conversion-core';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface QualityOptionPickerProps {
  mediaCategory?: 'video' | 'audio' | 'unknown';
  sourceWidth?: number;
  sourceHeight?: number;
  durationSeconds?: number;
  originalSizeBytes?: number;
  sourceCodec?: string;
  sourceIsAac?: boolean;
  onSelectAndDownload: (selection: {
    category: 'video' | 'audio';
    format: string;
    qualityId: string;
    isStreamCopy?: boolean;
    estimatedBytes: number;
    width?: number;
    height?: number;
    bitrateKbps?: number;
  }) => void;
  onTrimFirst?: () => void;
  onCompress?: (targetBytes: number) => void;
  onOpenAdvanced?: () => void;
  isProcessing?: boolean;
  progressPercent?: number;
  stageMessage?: string;
}

export function QualityOptionPicker({
  mediaCategory = 'video',
  sourceWidth = 1920,
  sourceHeight = 1080,
  durationSeconds = 60,
  originalSizeBytes = 45 * 1024 * 1024,
  sourceCodec = 'h264',
  sourceIsAac = false,
  onSelectAndDownload,
  onTrimFirst,
  onCompress,
  onOpenAdvanced,
  isProcessing = false,
  progressPercent = 0,
  stageMessage = 'Processing...',
}: QualityOptionPickerProps) {
  const { triggerHaptic } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>(
    mediaCategory === 'audio' ? 'audio' : 'video'
  );

  const videoOptions = generateVideoQualityOptions({
    sourceWidth,
    sourceHeight,
    durationSeconds,
    originalSizeBytes,
    sourceCodec,
  });

  const audioOptions = generateAudioQualityOptions({
    durationSeconds,
    sourceCodec,
    sourceIsAac,
  });

  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    videoOptions.find((o) => o.isRecommended)?.id || videoOptions[0]?.id || '720p'
  );

  const [selectedAudioId, setSelectedAudioId] = useState<string>(
    audioOptions.find((o) => o.isRecommended)?.id || audioOptions[0]?.id || '192k'
  );

  const currentVideoSelection =
    videoOptions.find((o) => o.id === selectedVideoId) || videoOptions[0];
  const currentAudioSelection =
    audioOptions.find((o) => o.id === selectedAudioId) || audioOptions[0];

  const handleDownloadClick = () => {
    triggerHaptic('medium');
    if (activeTab === 'video' && currentVideoSelection) {
      onSelectAndDownload({
        category: 'video',
        format: 'mp4',
        qualityId: currentVideoSelection.id,
        isStreamCopy: currentVideoSelection.isStreamCopy,
        estimatedBytes: currentVideoSelection.estimatedBytes,
        width: currentVideoSelection.width,
        height: currentVideoSelection.height,
        bitrateKbps: currentVideoSelection.videoBitrateKbps,
      });
    } else if (activeTab === 'audio' && currentAudioSelection) {
      onSelectAndDownload({
        category: 'audio',
        format: currentAudioSelection.format,
        qualityId: currentAudioSelection.id,
        isStreamCopy: currentAudioSelection.isStreamCopy,
        estimatedBytes: currentAudioSelection.estimatedBytes,
        bitrateKbps: currentAudioSelection.bitrateKbps,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs: Video vs Audio */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">Step 3: Choose Quality & Download</h4>
          <p className="text-xs text-neutral-400">Never upscaled. Stream copy (&lt;2s) enabled for matching containers.</p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('video');
            }}
            className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'video' ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'video' && (
              <motion.div
                layoutId="active-quality-tab-indicator"
                transition={springTokens.snappy}
                className="absolute inset-0 bg-blue-500/25 border border-blue-400/40 rounded-lg shadow-sm"
              />
            )}
            <Film className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Video (MP4)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('audio');
            }}
            className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'audio' ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'audio' && (
              <motion.div
                layoutId="active-quality-tab-indicator"
                transition={springTokens.snappy}
                className="absolute inset-0 bg-purple-500/25 border border-purple-400/40 rounded-lg shadow-sm"
              />
            )}
            <Music className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Audio (MP3 / M4A)</span>
          </button>
        </div>
      </div>

      {/* Quality Option Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {activeTab === 'video'
          ? videoOptions.map((opt) => {
              const isSelected = selectedVideoId === opt.id;
              return (
                <motion.div
                  key={opt.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedVideoId(opt.id);
                  }}
                  className={`relative cursor-pointer p-4 rounded-2xl border transition-all select-none overflow-hidden ${
                    isSelected
                      ? 'bg-blue-500/15 border-blue-400/50 shadow-lg shadow-blue-500/10'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-quality-tile-glow"
                      transition={springTokens.snappy}
                      className="absolute inset-0 border-2 border-cyan-400 rounded-2xl pointer-events-none"
                    />
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{opt.label}</span>
                        {opt.isRecommended && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                            <Star className="w-2.5 h-2.5 fill-amber-300" />
                            Best
                          </span>
                        )}
                        {opt.isStreamCopy && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                            <Zap className="w-2.5 h-2.5 fill-cyan-300" />
                            Fast Remux
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{opt.sublabel}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {opt.estimatedFormatted}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          : audioOptions.map((opt) => {
              const isSelected = selectedAudioId === opt.id;
              return (
                <motion.div
                  key={opt.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedAudioId(opt.id);
                  }}
                  className={`relative cursor-pointer p-4 rounded-2xl border transition-all select-none overflow-hidden ${
                    isSelected
                      ? 'bg-purple-500/15 border-purple-400/50 shadow-lg shadow-purple-500/10'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-quality-tile-glow"
                      transition={springTokens.snappy}
                      className="absolute inset-0 border-2 border-purple-400 rounded-2xl pointer-events-none"
                    />
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{opt.label}</span>
                        {opt.isRecommended && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                            <Star className="w-2.5 h-2.5 fill-amber-300" />
                            Best
                          </span>
                        )}
                        {opt.isStreamCopy && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                            <Zap className="w-2.5 h-2.5 fill-cyan-300" />
                            Instant
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{opt.sublabel}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-purple-300">
                        {opt.estimatedFormatted}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Progress Indicator if in flight */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-300 font-medium">{stageMessage}</span>
              <span className="font-mono text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Download CTA */}
      <div className="space-y-3 pt-2">
        <CupertinoButton
          variant="primary"
          size="lg"
          isLoading={isProcessing}
          disabled={isProcessing}
          onClick={handleDownloadClick}
          className="w-full text-base font-bold shadow-xl shadow-blue-500/20"
          leftIcon={<Download className="w-5 h-5" />}
        >
          {activeTab === 'video'
            ? `Download MP4 · ${currentVideoSelection?.label} · ${currentVideoSelection?.estimatedFormatted}`
            : `Download ${currentAudioSelection?.format.toUpperCase()} · ${currentAudioSelection?.label} · ${currentAudioSelection?.estimatedFormatted}`}
        </CupertinoButton>

        {/* Secondary Quick Action Tools */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-neutral-400">
          <span>Quick tools:</span>
          {onTrimFirst && (
            <button
              type="button"
              onClick={onTrimFirst}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Trim Clip First</span>
            </button>
          )}

          {onCompress && (
            <>
              <button
                type="button"
                onClick={() => onCompress(25 * 1024 * 1024)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Discord (25MB)</span>
              </button>
              <button
                type="button"
                onClick={() => onCompress(16 * 1024 * 1024)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp (16MB)</span>
              </button>
            </>
          )}

          {onOpenAdvanced && (
            <button
              type="button"
              onClick={onOpenAdvanced}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>More Formats</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Legal Compliance Line */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-2 text-center">
        <ShieldAlert className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span>Only download media you own or have permission to use.</span>
      </div>
    </div>
  );
}
