'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Sparkles } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface DropZonePrimitiveProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  isProcessing?: boolean;
}

export function DropZonePrimitive({
  onFileSelect,
  accept = 'video/*,audio/*',
  isProcessing = false,
}: DropZonePrimitiveProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
      triggerHaptic('light');
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    triggerHaptic('medium');
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={springTokens.snappy}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer overflow-hidden rounded-[32px] p-8 sm:p-14 border transition-all duration-300 text-center select-none ${
        isDragOver
          ? 'border-blue-400 bg-blue-500/10 shadow-2xl shadow-blue-500/25 scale-[1.02]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] shadow-2xl shadow-black/50'
      } backdrop-blur-3xl`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            triggerHaptic('medium');
            onFileSelect(file);
          }
        }}
      />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/5 via-transparent to-cyan-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Pulsing Animated Border when dragging */}
      {isDragOver && (
        <span className="pointer-events-none absolute inset-0 rounded-[32px] border-2 border-cyan-400 animate-pulse" />
      )}

      {/* Icon Capsule */}
      <motion.div
        animate={{ y: isDragOver ? -8 : 0 }}
        transition={springTokens.snappy}
        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600/30 to-cyan-400/20 border border-white/20 shadow-inner backdrop-blur-xl group-hover:shadow-blue-500/20 transition-shadow"
      >
        <UploadCloud className="h-10 w-10 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
      </motion.div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        Drop any video or audio here
      </h2>
      <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
        Or click to browse from your device. Converted instantly on-device whenever possible.
      </p>

      {/* Instant quick formats strip */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['MP4', 'MP3', 'WAV', 'WebM', 'GIF', 'AAC'].map((fmt) => (
          <span
            key={fmt}
            className="px-3 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-neutral-300"
          >
            {fmt}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
