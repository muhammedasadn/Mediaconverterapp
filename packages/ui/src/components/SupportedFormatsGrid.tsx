'use client';

import React, { useState } from 'react';
import { ALL_FORMATS, FormatDefinition } from '@universal/format-registry';
import { Video, Music, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SupportedFormatsGridProps {
  onSelectFormat?: (formatId: string) => void;
}

export const SupportedFormatsGrid: React.FC<SupportedFormatsGridProps> = ({
  onSelectFormat,
}) => {
  const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all');

  const formats: FormatDefinition[] = Object.values(ALL_FORMATS);

  const filtered = formats.filter((f) => {
    if (filter === 'all') return true;
    return f.category === filter;
  });

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
            <span>FORMAT MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Universal container & codec support.
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Powered by WebAssembly inside your browser and 64-core FFmpeg 7.x in the cloud.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 md:mt-0 flex items-center space-x-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
          {(['all', 'video', 'audio'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-200 ${
                filter === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((fmt) => {
          const isVideo = fmt.category === 'video';
          return (
            <motion.div
              key={fmt.id}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.15 }}
              onClick={() => onSelectFormat?.(fmt.id)}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-white/[0.06] hover:border-blue-500/30 hover:bg-zinc-900/80 cursor-pointer backdrop-blur-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
                  {fmt.extension}
                  {fmt.isRecommended && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      POPULAR
                    </span>
                  )}
                </span>
                <div
                  className={`p-1.5 rounded-lg ${
                    isVideo ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {isVideo ? <Video className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                {fmt.name}
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                {fmt.description}
              </p>

              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {fmt.supportsBrowserWasm ? 'Wasm + Cloud' : 'Cloud Turbo'}
                </span>
                <span className="text-zinc-500 font-mono">
                  .{fmt.extension}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
