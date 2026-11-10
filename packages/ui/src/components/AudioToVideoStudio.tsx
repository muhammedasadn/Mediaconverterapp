'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, Image as ImageIcon, Film, Sliders, Type, Disc3 } from 'lucide-react';
import { AudioWaveformVisualizer, VisualizerStyle } from './AudioWaveformVisualizer';
import { AspectRatioSelector, AspectRatio } from './AspectRatioSelector';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface AudioToVideoConfig {
  title: string;
  artist: string;
  aspectRatio: AspectRatio;
  visualizerStyle: VisualizerStyle;
  backgroundTheme: string;
  bgImageUrl?: string;
}

export interface AudioToVideoStudioProps {
  audioFileName: string;
  onExportVideo: (config: AudioToVideoConfig) => void;
  className?: string;
}

export function AudioToVideoStudio({
  audioFileName,
  onExportVideo,
  className = '',
}: AudioToVideoStudioProps) {
  const { triggerHaptic } = useHapticFeedback();
  const [title, setTitle] = useState(audioFileName.replace(/\.[^/.]+$/, ''));
  const [artist, setArtist] = useState('Universal Audio');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [visualizerStyle, setVisualizerStyle] = useState<VisualizerStyle>('bars');
  const [bgTheme, setBgTheme] = useState('linear-gradient(135deg, #0B0D12 0%, #082136 100%)');
  const [bgImage, setBgImage] = useState<string | null>(null);

  const themePresets = [
    { label: 'Obsidian Cyan', bg: 'linear-gradient(135deg, #0B0D12 0%, #082136 100%)' },
    { label: 'Deep Violet', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)' },
    { label: 'Neon Sunset', bg: 'linear-gradient(135deg, #1f0322 0%, #5c0f38 100%)' },
    { label: 'Dark Charcoal', bg: '#09090b' },
  ];

  const aspectClasses: Record<AspectRatio, string> = {
    '16:9': 'aspect-video max-w-xl',
    '9:16': 'aspect-[9/16] max-w-xs',
    '1:1': 'aspect-square max-w-sm',
    '4:5': 'aspect-[4/5] max-w-sm',
  };

  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-8 ${className}`}>
      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Audio-to-Video Studio</h3>
            <p className="text-xs text-neutral-400">Generate animated visuals, waveforms, and podcast clips for social media.</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 font-semibold">
          1080p Social Export
        </span>
      </div>

      {/* Live Composite Video Preview Frame */}
      <div className="flex justify-center p-4 rounded-3xl bg-black/60 border border-white/5">
        <div
          className={`relative w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col items-center justify-between p-6 transition-all duration-300 ${aspectClasses[aspectRatio]}`}
          style={{
            background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgTheme,
          }}
        >
          {/* Subtle noise texture */}
          <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

          {/* Top: Metadata Title/Artist */}
          <div className="relative z-10 text-center space-y-1 mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-[10px] font-mono text-cyan-300">
              <Disc3 className="h-3 w-3 animate-spin" />
              <span>NOW PLAYING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              {title || 'Untitled Track'}
            </h2>
            <p className="text-xs font-medium text-neutral-300 drop-shadow">
              {artist || 'Unknown Artist'}
            </p>
          </div>

          {/* Center/Bottom: Live Waveform Visualizer */}
          <div className="relative z-10 w-full h-28 flex items-center justify-center">
            <AudioWaveformVisualizer style={visualizerStyle} isPlaying={true} />
          </div>

          {/* Bottom Branding Stamp */}
          <div className="relative z-10 text-[9px] font-mono text-white/50 tracking-widest uppercase">
            Universal Converter Studio
          </div>
        </div>
      </div>

      {/* Editor Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Left Column: Track Info & Aspect Ratio */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Track Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="Song or Podcast Title"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Artist / Channel Name</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="Artist or Host"
            />
          </div>

          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
        </div>

        {/* Right Column: Visualizer Style & Background */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400">Waveform Visualizer Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['bars', 'wave', 'circle', 'pulse'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    triggerHaptic('light');
                    setVisualizerStyle(s);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs capitalize font-semibold transition-all ${
                    visualizerStyle === s
                      ? 'bg-purple-600/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
                      : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400">Background Atmosphere</label>
            <div className="grid grid-cols-2 gap-2">
              {themePresets.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    triggerHaptic('light');
                    setBgImage(null);
                    setBgTheme(t.bg);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    bgTheme === t.bg && !bgImage
                      ? 'border-cyan-400 text-white'
                      : 'border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                  style={{ background: t.bg }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Action */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <CupertinoButton
          variant="primary"
          size="lg"
          onClick={() =>
            onExportVideo({
              title,
              artist,
              aspectRatio,
              visualizerStyle,
              backgroundTheme: bgTheme,
              bgImageUrl: bgImage || undefined,
            })
          }
          leftIcon={<Sparkles className="h-5 w-5" />}
        >
          Render Video ({aspectRatio})
        </CupertinoButton>
      </div>
    </div>
  );
}
