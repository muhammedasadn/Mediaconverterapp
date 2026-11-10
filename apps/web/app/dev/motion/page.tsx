'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CupertinoButton,
  SegmentedControl,
  GlassCard,
  DynamicPill,
  MetricBadge,
  BottomSheet,
  DropZonePrimitive,
} from '@universal/ui';
import { ArrowLeft, Play, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

export default function MotionPlaygroundPage() {
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const [pillStatus, setPillStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [pillEngine, setPillEngine] = useState<'device' | 'cloud'>('device');
  const [progressVal, setProgressVal] = useState(42);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  return (
    <div className="min-h-screen p-4 sm:p-10 max-w-5xl mx-auto space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to App</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
          iOS Cupertino Motion Playground
        </span>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Component & Motion Brick Lab
        </h1>
        <p className="text-sm text-neutral-400">
          Live testing suite for Framer Motion spring physics, tactile haptic feedback, and Cupertino glassmorphic materials.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Dynamic Island Capsule Lab */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-cyan-400" />
            1. Dynamic Island Capsule (`DynamicPill`)
          </h2>
          <div className="py-6 flex justify-center bg-black/40 rounded-2xl border border-white/5">
            <DynamicPill
              status={pillStatus}
              engine={pillEngine}
              progressPercent={pillStatus === 'processing' ? progressVal : undefined}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {(['idle', 'processing', 'success', 'error'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPillStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                  pillStatus === s
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-white/5 text-neutral-400 border-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs text-neutral-400">Progress:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-mono text-neutral-300 w-8">{progressVal}%</span>
          </div>
        </GlassCard>

        {/* 2. Segmented Sliding Pills */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-400" />
            2. iOS Segmented Controls
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-neutral-400 mb-2">Target Container Format:</p>
              <SegmentedControl
                options={[
                  { value: 'mp4', label: 'MP4' },
                  { value: 'webm', label: 'WebM' },
                  { value: 'mp3', label: 'MP3' },
                  { value: 'wav', label: 'WAV' },
                  { value: 'gif', label: 'GIF' },
                ]}
                value={selectedFormat}
                onChange={setSelectedFormat}
                layoutId="playground-format-tab"
              />
            </div>

            <div>
              <p className="text-xs text-neutral-400 mb-2">Quality Preset:</p>
              <SegmentedControl
                options={[
                  { value: 'small', label: 'Small', badge: 'Fast' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'best', label: 'Pro' },
                ]}
                value={selectedPreset}
                onChange={setSelectedPreset}
                layoutId="playground-preset-tab"
              />
            </div>
          </div>
        </GlassCard>

        {/* 3. Tactile Cupertino Buttons */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">3. Tactile Buttons (`CupertinoButton`)</h2>
          <div className="flex flex-wrap gap-3">
            <CupertinoButton
              variant="primary"
              size="md"
              isLoading={isButtonLoading}
              onClick={() => {
                setIsButtonLoading(true);
                setTimeout(() => setIsButtonLoading(false), 1500);
              }}
            >
              Primary Spring Press
            </CupertinoButton>
            <CupertinoButton variant="secondary" size="md">
              Secondary Glass
            </CupertinoButton>
            <CupertinoButton variant="ghost" size="md">
              Ghost Button
            </CupertinoButton>
          </div>
        </GlassCard>

        {/* 4. Technical Metric Badges */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">4. Technical Metadata Badges</h2>
          <div className="flex flex-wrap gap-2">
            <MetricBadge label="Format" value="MP4" variant="accent" />
            <MetricBadge label="Codec" value="H.264" />
            <MetricBadge label="Bitrate" value="320" unit="kbps" />
            <MetricBadge label="Resolution" value="1920x1080" />
            <MetricBadge label="Audio" value="AAC Stereo" variant="success" />
          </div>
        </GlassCard>
      </div>

      {/* 5. Mobile Bottom Sheet */}
      <GlassCard className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">5. iOS Gesture Bottom Sheet</h2>
          <p className="text-xs text-neutral-400">Draggable modal with backdrop blur for mobile viewports.</p>
        </div>
        <CupertinoButton variant="primary" onClick={() => setIsSheetOpen(true)}>
          Open Sheet
        </CupertinoButton>
      </GlassCard>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Conversion Advanced Settings"
      >
        <div className="space-y-4 py-4 text-sm text-neutral-300">
          <p>
            This bottom sheet replicates the native iOS modal ergonomics: swipe down to dismiss, backdrop blur, and haptic feedback.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <CupertinoButton variant="secondary" onClick={() => setIsSheetOpen(false)}>
              Cancel
            </CupertinoButton>
            <CupertinoButton variant="primary" onClick={() => setIsSheetOpen(false)}>
              Save Settings
            </CupertinoButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
