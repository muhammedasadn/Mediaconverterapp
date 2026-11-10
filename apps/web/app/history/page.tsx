'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '../../components/AppHeader';
import { MobileTabBar } from '../../components/MobileTabBar';
import { HistoryManager, HistoryItem } from '@universal/ui';
import { ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: 'h1',
      filename: 'drone_vacation_4k.mov',
      targetFormat: 'mp4',
      originalSizeBytes: 142 * 1024 * 1024,
      outputSizeBytes: 38 * 1024 * 1024,
      date: 'Today, 11:42 AM',
      engineUsed: 'device',
    },
    {
      id: 'h2',
      filename: 'interview_podcast_raw.wav',
      targetFormat: 'mp3',
      originalSizeBytes: 86 * 1024 * 1024,
      outputSizeBytes: 14 * 1024 * 1024,
      date: 'Yesterday, 4:15 PM',
      engineUsed: 'cloud',
    },
    {
      id: 'h3',
      filename: 'product_demo_clip.webm',
      targetFormat: 'gif',
      originalSizeBytes: 24 * 1024 * 1024,
      outputSizeBytes: 6 * 1024 * 1024,
      date: 'Nov 8, 2:30 PM',
      engineUsed: 'device',
    },
  ]);

  const handleDelete = (id: string) => {
    setHistoryItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setHistoryItems([]);
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
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 font-semibold">
            Local Storage History
          </span>
        </div>

        <HistoryManager
          items={historyItems}
          onDeleteItem={handleDelete}
          onClearAll={handleClearAll}
          onReRunItem={(item) => alert(`Re-running conversion for ${item.filename}`)}
        />
      </main>

      <MobileTabBar />
    </div>
  );
}
