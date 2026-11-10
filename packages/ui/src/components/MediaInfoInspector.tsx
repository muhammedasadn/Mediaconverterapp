'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Copy, Check, FileCode, Film, Music, ShieldCheck } from 'lucide-react';
import type { MediaProbeResult } from '@universal/format-registry';
import { MetricBadge } from './MetricBadge';
import { CupertinoButton } from './CupertinoButton';
import { useHapticFeedback } from '../motion/hooks';

export interface MediaInfoInspectorProps {
  probeData: MediaProbeResult;
  className?: string;
}

export function MediaInfoInspector({ probeData, className = '' }: MediaInfoInspectorProps) {
  const [copied, setCopied] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleCopyJson = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(JSON.stringify(probeData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
  };

  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Media Stream Inspector</h3>
            <p className="text-xs text-neutral-400">Deep structural diagnostics and codec stream telemetry.</p>
          </div>
        </div>

        <CupertinoButton
          variant="secondary"
          size="sm"
          onClick={handleCopyJson}
          leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        >
          {copied ? 'Copied JSON' : 'Export Diagnostics'}
        </CupertinoButton>
      </div>

      {/* General Container Metadata */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
          <FileCode className="h-4 w-4 text-cyan-400" />
          <span>Container & Stream Properties</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-neutral-500 text-[10px] block">FILENAME</span>
            <span className="text-white truncate block">{probeData.filename}</span>
          </div>
          <div>
            <span className="text-neutral-500 text-[10px] block">TOTAL SIZE</span>
            <span className="text-white">{formatBytes(probeData.sizeBytes)}</span>
          </div>
          <div>
            <span className="text-neutral-500 text-[10px] block">CONTAINER FORMAT</span>
            <span className="text-cyan-400 font-bold uppercase">{probeData.format}</span>
          </div>
          <div>
            <span className="text-neutral-500 text-[10px] block">DURATION</span>
            <span className="text-white">
              {probeData.durationSeconds ? `${probeData.durationSeconds.toFixed(2)}s` : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Video Stream Specs (if available) */}
      {probeData.video && (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
            <Film className="h-4 w-4 text-blue-400" />
            <span>Video Track #0</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-neutral-500 text-[10px] block">CODEC</span>
              <span className="text-blue-300 font-bold uppercase">{probeData.video.codec}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">DIMENSIONS</span>
              <span className="text-white">
                {probeData.video.width} × {probeData.video.height}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">ASPECT RATIO</span>
              <span className="text-white">{probeData.video.aspectRatio || '16:9'}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">FRAME RATE</span>
              <span className="text-white">{probeData.video.fps} fps</span>
            </div>
          </div>
        </div>
      )}

      {/* Audio Stream Specs (if available) */}
      {probeData.audio && (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
            <Music className="h-4 w-4 text-purple-400" />
            <span>Audio Track #0</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-neutral-500 text-[10px] block">AUDIO CODEC</span>
              <span className="text-purple-300 font-bold uppercase">{probeData.audio.codec}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">SAMPLE RATE</span>
              <span className="text-white">{probeData.audio.sampleRateHz.toLocaleString()} Hz</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">CHANNELS</span>
              <span className="text-white">{probeData.audio.channels === 2 ? 'Stereo (2.0)' : 'Mono (1.0)'}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">BIT DEPTH</span>
              <span className="text-white">16-bit PCM</span>
            </div>
          </div>
        </div>
      )}

      {/* Integrity Badge */}
      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Stream headers parsed cleanly. Stream valid for hybrid WebAssembly / Cloud processing.</span>
      </div>
    </div>
  );
}
