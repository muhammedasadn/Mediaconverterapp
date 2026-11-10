'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Music, Scissors, Minimize2, ArrowRight } from 'lucide-react';
import { scaleInVariant } from '@universal/ui';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const actions = [
    { id: 'mp4', title: 'Convert to MP4 Video', category: 'Video', icon: Film },
    { id: 'webm', title: 'Convert to WebM', category: 'Video', icon: Film },
    { id: 'mp3', title: 'Extract to MP3 Audio', category: 'Audio', icon: Music },
    { id: 'wav', title: 'Convert to Lossless WAV', category: 'Audio', icon: Music },
    { id: 'compress', title: 'Compress File Size', category: 'Tools', icon: Minimize2 },
    { id: 'trim', title: 'Trim & Cut Video/Audio', category: 'Editor', icon: Scissors },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            variants={scaleInVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-3xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 px-2">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a format, tool, or action..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-400">
                ESC
              </kbd>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={onClose}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-neutral-300 hover:text-white hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-cyan-400 group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-[10px] text-neutral-500">{item.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
