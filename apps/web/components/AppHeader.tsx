'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Command, Sun, Moon, PlaySquare } from 'lucide-react';
import { DynamicPill, CupertinoButton } from '@universal/ui';

export interface AppHeaderProps {
  onOpenCommandPalette?: () => void;
}

export function AppHeader({ onOpenCommandPalette }: AppHeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950/70 backdrop-blur-2xl px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              Universal
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              Converter
            </span>
          </div>
        </Link>

        {/* Center: Dynamic Island Capsule */}
        <div className="hidden md:flex items-center">
          <DynamicPill status="idle" engine="device" />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Studio Links */}
          <Link href="/compress" className="hidden xl:inline-block text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors">
            Compress
          </Link>
          <Link href="/edit" className="hidden xl:inline-block text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors">
            Trim/Cut
          </Link>
          <Link href="/audio-to-video" className="hidden xl:inline-block text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors">
            Audio→Video
          </Link>
          <Link href="/batch" className="hidden xl:inline-block text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors">
            Batch
          </Link>
          <Link href="/info" className="hidden xl:inline-block text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors">
            Media Info
          </Link>

          {/* Motion Playground Link */}
          <Link href="/dev/motion">
            <CupertinoButton variant="ghost" size="sm" leftIcon={<PlaySquare className="h-4 w-4 text-cyan-400" />}>
              <span className="hidden sm:inline">Motion Lab</span>
            </CupertinoButton>
          </Link>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Command className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-neutral-800" />}
          </button>
        </div>
      </div>
    </header>
  );
}
