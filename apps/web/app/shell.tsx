'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Cpu } from 'lucide-react';
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
  const [isCloudOnline, setIsCloudOnline] = useState<boolean | null>(null);

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

  // Backend Healthcheck Polling (Liveness check on mount and every 60s)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const isCloudEnabled = process.env.NEXT_PUBLIC_CLOUD_ENGINE_ENABLED !== 'false';

    if (!isCloudEnabled) {
      setIsCloudOnline(false);
      return;
    }

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${apiUrl}/api/health`, {
          signal: controller.signal,
          mode: 'cors',
        });
        clearTimeout(timeoutId);
        setIsCloudOnline(res.ok);
      } catch {
        setIsCloudOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
      {/* Top Notification Bar for Fallback / Device Only Mode */}
      {isCloudOnline === false && (
        <aside aria-label="Engine Mode" className="w-full bg-emerald-950/40 border-b border-emerald-500/20 backdrop-blur-md px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Private On-Device Mode:</strong> Cloud cluster offline. Conversions run entirely inside your browser (zero server uploads).
          </span>
        </aside>
      )}

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
