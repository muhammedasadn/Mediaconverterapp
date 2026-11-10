'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Moon, Sun, Shield, HardDrive, Trash2, Check, Cpu } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@universal/i18n';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export function SettingsPanel() {
  const { triggerHaptic } = useHapticFeedback();
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [defaultQuality, setDefaultQuality] = useState('balanced');
  const [defaultEngine, setDefaultEngine] = useState('auto');
  const [zeroTelemetry, setZeroTelemetry] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = async () => {
    triggerHaptic('medium');
    if (typeof window !== 'undefined' && 'caches' in window) {
      const keys = await caches.keys();
      for (const k of keys) {
        await caches.delete(k);
      }
    }
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="p-6 sm:p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">App Preferences</h3>
          <p className="text-xs text-neutral-400">Manage localization, conversion defaults, and offline storage.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Group 1: General & Appearance */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
            General & Localization
          </h4>
          <div className="rounded-2xl border border-white/10 bg-black/40 divide-y divide-white/5">
            {/* Language Selector */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Display Language</span>
              </div>
              <select
                value={currentLang}
                onChange={(e) => {
                  triggerHaptic('light');
                  setCurrentLang(e.target.value as SupportedLanguage);
                }}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-neutral-900 text-white">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
                <span className="text-sm font-medium text-white">Interface Theme</span>
              </div>
              <div className="flex gap-1 p-1 rounded-xl bg-white/10 border border-white/10">
                <button
                  onClick={() => {
                    setTheme('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => {
                    setTheme('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    theme === 'light' ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Group 2: Conversion Defaults */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
            Engine & Preset Defaults
          </h4>
          <div className="rounded-2xl border border-white/10 bg-black/40 divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="h-4 w-4 text-blue-400" />
                <div>
                  <span className="text-sm font-medium text-white block">Default Engine</span>
                  <span className="text-[11px] text-neutral-400">Controls automatic hybrid routing</span>
                </div>
              </div>
              <select
                value={defaultEngine}
                onChange={(e) => setDefaultEngine(e.target.value)}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="auto" className="bg-neutral-900">Smart Hybrid (Auto)</option>
                <option value="device" className="bg-neutral-900">Device Wasm Only</option>
                <option value="cloud" className="bg-neutral-900">Cloud Turbo Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Group 3: Privacy & Storage */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
            Storage & Privacy
          </h4>
          <div className="rounded-2xl border border-white/10 bg-black/40 divide-y divide-white/5">
            {/* Zero Telemetry Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-emerald-400" />
                <div>
                  <span className="text-sm font-medium text-white block">Strict Privacy Mode</span>
                  <span className="text-[11px] text-neutral-400">Zero analytical tracking and zero crash telemetry</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={zeroTelemetry}
                onChange={(e) => setZeroTelemetry(e.target.checked)}
                className="h-5 w-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Clear Cached Wasm Engine */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-neutral-400" />
                <div>
                  <span className="text-sm font-medium text-white block">WebAssembly Engine Cache</span>
                  <span className="text-[11px] text-neutral-400">Cached ~32MB offline FFmpeg binaries</span>
                </div>
              </div>
              <CupertinoButton
                variant="ghost"
                size="sm"
                onClick={handleClearCache}
                leftIcon={cacheCleared ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Trash2 className="h-3.5 w-3.5 text-red-400" />}
              >
                {cacheCleared ? 'Cache Cleared' : 'Clear Cache'}
              </CupertinoButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
