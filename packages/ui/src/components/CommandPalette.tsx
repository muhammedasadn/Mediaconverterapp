'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Video,
  Music,
  Scissors,
  Layers,
  Sparkles,
  Info,
  Clock,
  Settings,
  X,
  FileCode,
  Link2,
  Youtube,
} from 'lucide-react';
import { springSnappy } from '../motion/springs';

export interface CommandItem {
  id: string;
  title: string;
  category: 'tools' | 'formats' | 'actions';
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onSelectFormat?: (formatId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectFormat,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = useMemo(() => {
    return [
      {
        id: 'home',
        title: 'Universal Converter',
        category: 'tools',
        subtitle: 'Convert between video, audio, and image formats',
        icon: <Video className="w-4 h-4 text-blue-400" />,
        action: () => {
          onNavigate('/');
          onClose();
        },
      },
      {
        id: 'compress',
        title: 'Target Size Compressor',
        category: 'tools',
        subtitle: 'Compress for Discord (25MB), WhatsApp (16MB), or Email',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('/compress');
          onClose();
        },
      },
      {
        id: 'edit',
        title: 'Sub-Frame Video Editor',
        category: 'tools',
        subtitle: 'Frame-accurate trimming and sub-second cut',
        icon: <Scissors className="w-4 h-4 text-amber-400" />,
        action: () => {
          onNavigate('/edit');
          onClose();
        },
      },
      {
        id: 'batch',
        title: 'Batch Queue Studio',
        category: 'tools',
        subtitle: 'Bulk conversion and multi-file ZIP bundling',
        icon: <Layers className="w-4 h-4 text-purple-400" />,
        action: () => {
          onNavigate('/batch');
          onClose();
        },
      },
      {
        id: 'audio-to-video',
        title: 'Audio-to-Video Studio',
        category: 'tools',
        subtitle: 'Generate 1080p visualizer videos for social media',
        icon: <Music className="w-4 h-4 text-pink-400" />,
        action: () => {
          onNavigate('/audio-to-video');
          onClose();
        },
      },
      {
        id: 'info',
        title: 'Media Stream Inspector',
        category: 'tools',
        subtitle: 'Deep codec analysis, bitrates, sample rates',
        icon: <Info className="w-4 h-4 text-cyan-400" />,
        action: () => {
          onNavigate('/info');
          onClose();
        },
      },
      {
        id: 'history',
        title: 'Conversion History',
        category: 'tools',
        subtitle: 'View recent files and local conversion logs',
        icon: <Clock className="w-4 h-4 text-indigo-400" />,
        action: () => {
          onNavigate('/history');
          onClose();
        },
      },
      {
        id: 'import',
        title: 'Open Link Import',
        category: 'tools',
        subtitle: 'Direct public media & Creative Commons archives',
        icon: <Link2 className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('/import');
          onClose();
        },
      },
      {
        id: 'youtube',
        title: 'YouTube Creator Helper',
        category: 'tools',
        subtitle: 'Official YouTube Studio export & CC audio guide',
        icon: <Youtube className="w-4 h-4 text-red-400" />,
        action: () => {
          onNavigate('/youtube');
          onClose();
        },
      },
      {
        id: 'mp4-to-mp3',
        title: 'MP4 to MP3 Audio Extractor',
        category: 'tools',
        subtitle: 'Instant browser-side MP3 conversion at 320kbps',
        icon: <Music className="w-4 h-4 text-purple-400" />,
        action: () => {
          onNavigate('/mp4-to-mp3');
          onClose();
        },
      },
      {
        id: 'settings',
        title: 'System Settings',
        category: 'tools',
        subtitle: 'Theme, motion preferences, cache controls',
        icon: <Settings className="w-4 h-4 text-zinc-400" />,
        action: () => {
          onNavigate('/settings');
          onClose();
        },
      },
      // Target Format Shortcuts
      {
        id: 'fmt-mp4',
        title: 'Export to MP4 Video',
        category: 'formats',
        subtitle: 'H.264 / AAC universal compatibility',
        icon: <FileCode className="w-4 h-4 text-blue-400" />,
        action: () => {
          onSelectFormat?.('mp4');
          onNavigate('/');
          onClose();
        },
      },
      {
        id: 'fmt-webm',
        title: 'Export to WebM Video',
        category: 'formats',
        subtitle: 'VP9 / Opus open web standard',
        icon: <FileCode className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onSelectFormat?.('webm');
          onNavigate('/');
          onClose();
        },
      },
      {
        id: 'fmt-mp3',
        title: 'Extract to MP3 Audio',
        category: 'formats',
        subtitle: 'LAME MP3 universal audio stream',
        icon: <FileCode className="w-4 h-4 text-purple-400" />,
        action: () => {
          onSelectFormat?.('mp3');
          onNavigate('/');
          onClose();
        },
      },
      {
        id: 'fmt-wav',
        title: 'Extract to Lossless WAV',
        category: 'formats',
        subtitle: '16/24-bit PCM studio waveform',
        icon: <FileCode className="w-4 h-4 text-cyan-400" />,
        action: () => {
          onSelectFormat?.('wav');
          onNavigate('/');
          onClose();
        },
      },
      {
        id: 'fmt-gif',
        title: 'Create Animated GIF',
        category: 'formats',
        subtitle: 'Looping social animation',
        icon: <FileCode className="w-4 h-4 text-amber-400" />,
        action: () => {
          onSelectFormat?.('gif');
          onNavigate('/');
          onClose();
        },
      },
    ];
  }, [onNavigate, onClose, onSelectFormat]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={springSnappy}
            className="relative w-full max-w-xl bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10">
              <Search className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search tools, formats, or actions... (Esc to close)"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-zinc-500 font-sans"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-zinc-500 hover:text-zinc-300 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/5 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">
                  No matching tools or formats found for &quot;{query}&quot;
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                          : 'hover:bg-white/5 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-500/20' : 'bg-white/5'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-zinc-400 truncate">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard Guide */}
            <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center space-x-3">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">↑↓</kbd> to
                  navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">↵</kbd> to
                  select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Esc</kbd> to
                  close
                </span>
              </div>
              <span className="text-zinc-600">Universal Media Converter</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
