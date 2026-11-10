'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Video,
  Sparkles,
  Scissors,
  Layers,
  Music,
  Clock,
  Settings,
  Search,
  Moon,
  Sun,
  Globe,
  Github,
  Link2,
  Youtube,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface CupertinoNavbarProps {
  onOpenCommandPalette: () => void;
  activeLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export const CupertinoNavbar: React.FC<CupertinoNavbarProps> = ({
  onOpenCommandPalette,
  activeLanguage = 'en',
  onSelectLanguage,
}) => {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    // Sync with HTML element
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const navLinks = [
    { href: '/', label: 'Convert', icon: Video },
    { href: '/compress', label: 'Compress', icon: Sparkles },
    { href: '/edit', label: 'Trim', icon: Scissors },
    { href: '/import', label: 'Import', icon: Link2 },
    { href: '/youtube', label: 'YouTube', icon: Youtube },
    { href: '/batch', label: 'Batch', icon: Layers },
    { href: '/audio-to-video', label: 'Studio', icon: Music },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ml', label: 'മലയാളം' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-zinc-950/75 backdrop-blur-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white tracking-tight flex items-center gap-1.5">
              Universal Media
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-zinc-400 font-sans hidden sm:inline">
              Hybrid Wasm + Cloud
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-full backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-md shadow-blue-500/25 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Search Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs text-zinc-400 hover:text-white transition-all duration-150"
            title="Open Command Palette (Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline text-zinc-400">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] rounded bg-white/[0.08] text-zinc-300 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-zinc-900/95 border border-white/10 shadow-xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage?.(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                      activeLanguage === lang.code
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[10px] opacity-60 uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* History Link */}
          <Link
            href="/history"
            className={`p-2 rounded-xl transition-all ${
              pathname === '/history'
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Conversion History"
          >
            <Clock className="w-4 h-4" />
          </Link>

          {/* Settings Link */}
          <Link
            href="/settings"
            className={`p-2 rounded-xl transition-all ${
              pathname === '/settings'
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/muhammedasadn/Mediaconverterapp"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
