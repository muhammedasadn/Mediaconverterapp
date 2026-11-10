'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Columns, Eye } from 'lucide-react';
import { useHapticFeedback } from '../motion/hooks';

export interface SplitComparisonViewerProps {
  originalSrc?: string;
  compressedSrc?: string;
  originalLabel?: string;
  compressedLabel?: string;
  isVideo?: boolean;
  className?: string;
}

export function SplitComparisonViewer({
  originalSrc,
  compressedSrc,
  originalLabel = 'Original Source',
  compressedLabel = 'Compressed Preview',
  isVideo = false,
  className = '',
}: SplitComparisonViewerProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative overflow-hidden rounded-[28px] border border-white/20 bg-black/60 select-none cursor-ew-resize h-72 sm:h-96 shadow-2xl ${className}`}
    >
      {/* Background Layer: Original Media */}
      <div className="absolute inset-0 h-full w-full flex items-center justify-center">
        {originalSrc ? (
          isVideo ? (
            <video src={originalSrc} className="h-full w-full object-contain" muted playsInline autoPlay loop />
          ) : (
            <img src={originalSrc} alt="Original" className="h-full w-full object-contain" />
          )
        ) : (
          <div className="text-neutral-500 text-xs font-mono">Original Media Preview</div>
        )}
      </div>

      {/* Foreground Layer (Clipped): Compressed Media */}
      <div
        className="absolute inset-0 h-full w-full flex items-center justify-center overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {compressedSrc || originalSrc ? (
          isVideo ? (
            <video src={compressedSrc || originalSrc} className="h-full w-full object-contain brightness-95" muted playsInline autoPlay loop />
          ) : (
            <img src={compressedSrc || originalSrc} alt="Compressed" className="h-full w-full object-contain" />
          )
        ) : null}
      </div>

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono font-semibold text-white">
        {compressedLabel}
      </div>

      <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono font-semibold text-neutral-400">
        {originalLabel}
      </div>

      {/* Draggable Divider Handle */}
      <div
        className="absolute top-0 bottom-0 z-30 w-[2px] bg-white pointer-events-none shadow-[0_0_12px_rgba(255,255,255,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-xl border border-black/10">
          <Columns className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
