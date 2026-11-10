'use client';

import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { MobileTabBar } from '../components/MobileTabBar';
import { CommandPalette } from '../components/CommandPalette';
import {
  DropZonePrimitive,
  GlassCard,
  CupertinoButton,
  fadeUpVariant,
  staggerContainerVariant,
} from '@universal/ui';
import { motion } from 'framer-motion';
import {
  Film,
  Music,
  Minimize2,
  Scissors,
  Share2,
  Layers,
  Shield,
  Zap,
  WifiOff,
} from 'lucide-react';

export default function HomePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // In Phase 2, this will morph into the conversion workspace
  };

  const tools = [
    {
      title: 'Video Studio',
      desc: 'Transcode to MP4, WebM, HEVC, and ProRes with custom resolution.',
      icon: Film,
      color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400',
    },
    {
      title: 'Audio Extractor',
      desc: 'Extract MP3, WAV, AAC, and FLAC soundtracks at up to 320kbps.',
      icon: Music,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400',
    },
    {
      title: 'Smart Compressor',
      desc: 'Reduce file sizes by up to 80% while retaining crystal clarity.',
      icon: Minimize2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    },
    {
      title: 'Trim & Merge',
      desc: 'Sub-frame precision cutting, video splicing, and audio alignment.',
      icon: Scissors,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
    },
    {
      title: 'Audio to Video',
      desc: 'Generate animated waveforms and visuals for podcasts and music.',
      icon: Share2,
      color: 'from-pink-500/20 to-rose-500/10 text-pink-400',
    },
    {
      title: 'GIF Maker',
      desc: 'Convert high-framerate video clips into smooth looping animated GIFs.',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-300',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 space-y-16">
        {/* Hero Section */}
        <motion.section
          variants={staggerContainerVariant}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4"
        >
          <motion.div variants={fadeUpVariant} className="inline-block">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-cyan-400">
              ⚡ Next-Generation Media Engine
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUpVariant}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight"
          >
            Convert, Compress & Edit at the Speed of Light
          </motion.h1>

          <motion.p
            variants={fadeUpVariant}
            className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto"
          >
            Instant on-device processing powered by WebAssembly. Your files never leave your browser unless you choose cloud turbo.
          </motion.p>

          {/* Primary Drop Zone */}
          <motion.div variants={fadeUpVariant} className="pt-6 max-w-3xl mx-auto">
            <DropZonePrimitive onFileSelect={handleFileSelect} />
            {selectedFile && (
              <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/20 text-sm text-white flex items-center justify-between">
                <span>Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                <CupertinoButton size="sm" onClick={() => setSelectedFile(null)}>Clear</CupertinoButton>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Trust Badges Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard intensity="subtle" className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">100% Private</h3>
              <p className="text-xs text-neutral-400">Files processed on-device. Zero data logging.</p>
            </div>
          </GlassCard>

          <GlassCard intensity="subtle" className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Instant Starts</h3>
              <p className="text-xs text-neutral-400">No queues or uploads for local conversions.</p>
            </div>
          </GlassCard>

          <GlassCard intensity="subtle" className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Offline Ready</h3>
              <p className="text-xs text-neutral-400">Install as PWA and convert without internet.</p>
            </div>
          </GlassCard>
        </section>

        {/* Tool Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">Creative Tool Suite</h2>
            <span className="text-xs font-mono text-neutral-400">6 Modular Engines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <GlassCard
                  key={tool.title}
                  intensity="medium"
                  whileHover={{ y: -4 }}
                  className="p-6 cursor-pointer group"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${tool.color} border border-white/10 mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-cyan-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{tool.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </section>
      </main>

      <MobileTabBar />
    </div>
  );
}
