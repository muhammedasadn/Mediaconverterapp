'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, FileArchive, CheckCircle, Clock, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface BatchFileItem {
  id: string;
  name: string;
  sizeBytes: number;
  targetFormat: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress?: number;
}

export interface BatchQueueManagerProps {
  items: BatchFileItem[];
  onFormatChange: (id: string, format: string) => void;
  onApplyAllFormat: (format: string) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onStartBatch: () => void;
  onDownloadZip: () => void;
  className?: string;
}

export function BatchQueueManager({
  items,
  onFormatChange,
  onApplyAllFormat,
  onRemoveItem,
  onMoveItem,
  onStartBatch,
  onDownloadZip,
  className = '',
}: BatchQueueManagerProps) {
  const { triggerHaptic } = useHapticFeedback();

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const isAllCompleted = completedCount === items.length && items.length > 0;
  const isAnyConverting = items.some((i) => i.status === 'converting');

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Batch Queue Manager</h3>
            <p className="text-xs text-neutral-400">
              {items.length} files queued ({completedCount}/{items.length} completed)
            </p>
          </div>
        </div>

        {/* Apply All Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Apply to all:</span>
          <select
            onChange={(e) => onApplyAllFormat(e.target.value)}
            className="rounded-xl bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="">Choose format...</option>
            <option value="mp4">MP4 Video</option>
            <option value="webm">WebM Video</option>
            <option value="mp3">MP3 Audio</option>
            <option value="wav">WAV Audio</option>
          </select>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            transition={springTokens.snappy}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors gap-3"
          >
            {/* Left Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white truncate">{item.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">({formatBytes(item.sizeBytes)})</span>
              </div>

              {/* Progress bar if converting */}
              {item.status === 'converting' && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${item.progress || 25}%` }}
                  />
                </div>
              )}
            </div>

            {/* Target Format Selector */}
            <div className="flex items-center gap-2">
              <select
                value={item.targetFormat}
                onChange={(e) => onFormatChange(item.id, e.target.value)}
                disabled={item.status === 'converting' || item.status === 'completed'}
                className="rounded-lg bg-black/50 border border-white/10 px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WEBM</option>
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="gif">GIF</option>
              </select>

              {/* Reorder Buttons */}
              <div className="flex flex-col">
                <button
                  disabled={index === 0}
                  onClick={() => onMoveItem(index, index - 1)}
                  className="text-neutral-500 hover:text-white disabled:opacity-20"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  disabled={index === items.length - 1}
                  onClick={() => onMoveItem(index, index + 1)}
                  className="text-neutral-500 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onRemoveItem(item.id);
                }}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Batch Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
        <span className="text-xs text-neutral-400">
          Estimated total: {formatBytes(items.reduce((acc, i) => acc + i.sizeBytes, 0))}
        </span>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAllCompleted ? (
            <CupertinoButton
              variant="primary"
              size="md"
              onClick={onDownloadZip}
              leftIcon={<FileArchive className="h-4 w-4" />}
            >
              Download All as ZIP
            </CupertinoButton>
          ) : (
            <CupertinoButton
              variant="primary"
              size="md"
              isLoading={isAnyConverting}
              onClick={onStartBatch}
            >
              Convert All {items.length} Files
            </CupertinoButton>
          )}
        </div>
      </div>
    </div>
  );
}
