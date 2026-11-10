'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '../../components/AppHeader';
import { MobileTabBar } from '../../components/MobileTabBar';
import {
  DropZonePrimitive,
  BatchQueueManager,
  BatchFileItem,
  CupertinoButton,
} from '@universal/ui';
import { ArrowLeft, Layers, Plus } from 'lucide-react';

export default function BatchQueuePage() {
  const [queueItems, setQueueItems] = useState<BatchFileItem[]>([
    {
      id: '1',
      name: 'cinematic_drone_shot.mov',
      sizeBytes: 84 * 1024 * 1024,
      targetFormat: 'mp4',
      status: 'pending',
    },
    {
      id: '2',
      name: 'podcast_episode_final.wav',
      sizeBytes: 42 * 1024 * 1024,
      targetFormat: 'mp3',
      status: 'pending',
    },
    {
      id: '3',
      name: 'reaction_clip_meme.mp4',
      sizeBytes: 15 * 1024 * 1024,
      targetFormat: 'gif',
      status: 'pending',
    },
  ]);

  const handleFormatChange = (id: string, format: string) => {
    setQueueItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, targetFormat: format } : item))
    );
  };

  const handleApplyAll = (format: string) => {
    if (!format) return;
    setQueueItems((prev) => prev.map((item) => ({ ...item, targetFormat: format })));
  };

  const handleRemove = (id: string) => {
    setQueueItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    setQueueItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      if (moved) copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const handleStartBatch = () => {
    // Sequentially mark as converting then completed
    setQueueItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        status: idx === 0 ? 'converting' : 'pending',
        progress: idx === 0 ? 45 : 0,
      }))
    );

    setTimeout(() => {
      setQueueItems((prev) =>
        prev.map((item) => ({ ...item, status: 'completed', progress: 100 }))
      );
    }, 2500);
  };

  const handleDownloadZip = () => {
    alert('Generating combined ZIP archive with all converted files...');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-cyan-400 font-semibold">
            Batch Queue Studio
          </span>
        </div>

        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Batch Media Processor & ZIP Bundler
          </h1>
          <p className="text-sm text-neutral-400">
            Enqueue multiple audio and video tracks, adjust settings individually or with "Apply to all", and download everything as one ZIP.
          </p>
        </header>

        <BatchQueueManager
          items={queueItems}
          onFormatChange={handleFormatChange}
          onApplyAllFormat={handleApplyAll}
          onRemoveItem={handleRemove}
          onMoveItem={handleMove}
          onStartBatch={handleStartBatch}
          onDownloadZip={handleDownloadZip}
        />
      </main>

      <MobileTabBar />
    </div>
  );
}
