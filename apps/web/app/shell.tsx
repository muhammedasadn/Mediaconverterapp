'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CupertinoNavbar,
  CupertinoBottomNav,
  CupertinoFooter,
  CommandPalette,
} from '@universal/ui';

export function CupertinoShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lang, setLang] = useState('en');

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
      {/* Top Navigation */}
      <CupertinoNavbar
        onOpenCommandPalette={() => setPaletteOpen(true)}
        activeLanguage={lang}
        onSelectLanguage={(l) => setLang(l)}
      />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Mobile Floating Bottom Dock */}
      <CupertinoBottomNav />

      {/* Command Palette Spotlight */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(href) => router.push(href)}
      />

      {/* Cupertino Global Footer */}
      <CupertinoFooter />
    </div>
  );
}
