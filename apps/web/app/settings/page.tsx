'use client';

import React from 'react';
import Link from 'next/link';
import { SettingsPanel, PWAInstallPromptCard } from '@universal/ui';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
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
            System & Storage Settings
          </span>
        </div>

        {/* PWA Install Banner */}
        <PWAInstallPromptCard />

        {/* iOS Grouped Settings */}
        <SettingsPanel />
      </main>
    </div>
  );
}
