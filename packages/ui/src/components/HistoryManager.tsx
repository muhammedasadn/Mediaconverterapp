'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Trash2, Download, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface HistoryItem {
  id: string;
  filename: string;
  targetFormat: string;
  originalSizeBytes: number;
  outputSizeBytes: number;
  date: string;
  engineUsed: 'device' | 'cloud';
}

export interface HistoryManagerProps {
  items: HistoryItem[];
  onClearAll: () => void;
  onDeleteItem: (id: string) => void;
  onReRunItem?: (item: HistoryItem) => void;
  className?: string;
}

export function HistoryManager({
  items,
  onClearAll,
  onDeleteItem,
  onReRunItem,
  className = '',
}: HistoryManagerProps) {
  const [search, setSearch] = useState('');
  const { triggerHaptic } = useHapticFeedback();

  const filtered = items.filter(
    (i) =>
      i.filename.toLowerCase().includes(search.toLowerCase()) ||
      i.targetFormat.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Conversion History</h3>
            <p className="text-xs text-neutral-400">
              Stored 100% locally in your browser storage. Never tracked.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <CupertinoButton
            variant="ghost"
            size="sm"
            onClick={() => {
              triggerHaptic('medium');
              onClearAll();
            }}
            leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-400" />}
          >
            Clear History
          </CupertinoButton>
        )}
      </div>

      {/* Search Input */}
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past conversions..."
            className="w-full rounded-2xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto">
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const savings = Math.max(
                0,
                Math.round(((item.originalSizeBytes - item.outputSizeBytes) / item.originalSizeBytes) * 100)
              );

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springTokens.snappy}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate max-w-sm">
                        {item.filename}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                        {item.targetFormat}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                      <span>{formatBytes(item.outputSizeBytes)}</span>
                      {savings > 0 && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3" />
                          -{savings}%
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                        <Clock className="h-3 w-3" />
                        {item.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {onReRunItem && (
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          onReRunItem(item);
                        }}
                        className="p-2 rounded-xl bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Re-run"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        onDeleteItem(item.id);
                      }}
                      className="p-2 rounded-xl bg-white/5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-neutral-500 font-mono">
              {items.length === 0 ? 'No conversions yet. Converted files will appear here.' : 'No matching conversions found.'}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
