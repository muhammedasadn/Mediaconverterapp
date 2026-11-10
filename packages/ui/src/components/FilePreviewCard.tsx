'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Music, X, Play, Pause, FileSpreadsheet } from 'lucide-react';
import { MediaProbeResult } from '@universal/format-registry';
import { MetricBadge } from './MetricBadge';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface FilePreviewCardProps {
  file: File;
  probeResult?: MediaProbeResult | null;
  onRemove: () => void;
  className?: string;
}

export function FilePreviewCard({
  file,
  probeResult,
  onRemove,
  className = '',
}: FilePreviewCardProps) {
  const { triggerHaptic } = useHapticFeedback();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isVideo = file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(file.name.split('.').pop() || '');
  const isAudio = file.type.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'flac'].includes(file.name.split('.').pop() || '');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      layoutId="active-file-card"
      transition={springTokens.snappy}
      className={`relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.04] p-5 sm:p-7 backdrop-blur-3xl shadow-2xl ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px -15px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Media Visual Preview */}
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center">
            {isVideo && previewUrl ? (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
                loop
                autoPlay
              />
            ) : isAudio ? (
              <div className="flex flex-col items-center justify-center text-purple-400">
                <Music className="h-8 w-8 animate-pulse" />
              </div>
            ) : (
              <Film className="h-8 w-8 text-cyan-400" />
            )}
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-mono text-white uppercase font-bold">
              {file.name.split('.').pop()}
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base sm:text-lg font-bold text-white">
              {file.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">{formatBytes(file.size)}</span>
              <span>•</span>
              <span>{formatDuration(probeResult?.durationSeconds)}</span>
              {probeResult?.video && (
                <>
                  <span>•</span>
                  <span>{probeResult.video.width}×{probeResult.video.height}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Technical Badges & Remove Button */}
        <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-3 pt-2 md:pt-0 border-t border-white/5 md:border-none">
          <div className="flex flex-wrap gap-1.5">
            {probeResult?.video?.codec && (
              <MetricBadge label="Video" value={probeResult.video.codec.toUpperCase()} variant="accent" />
            )}
            {probeResult?.audio?.sampleRateHz && (
              <MetricBadge label="Audio" value={`${probeResult.audio.sampleRateHz / 1000}kHz`} />
            )}
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onRemove();
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Remove File"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
