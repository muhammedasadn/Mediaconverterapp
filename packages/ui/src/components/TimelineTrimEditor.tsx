'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Scissors, RotateCcw, FastForward, Rewind, Volume2 } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface TimelineTrimEditorProps {
  mediaSrc: string;
  durationSeconds: number;
  onTrimChange: (startSeconds: number, endSeconds: number, mode?: 'lossless' | 'precise') => void;
  className?: string;
}

export function TimelineTrimEditor({
  mediaSrc,
  durationSeconds,
  onTrimChange,
  className = '',
}: TimelineTrimEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(durationSeconds || 60);
  const [mode, setMode] = useState<'lossless' | 'precise'>('lossless');

  // Sync video time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Loop within trim range
    if (t >= endTime) {
      videoRef.current.currentTime = startTime;
      if (!isPlaying) videoRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Keyboard Shortcuts (Space, J/K/L, I, O, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'j': // Rewind
          if (videoRef.current) videoRef.current.currentTime = Math.max(startTime, videoRef.current.currentTime - 2);
          break;
        case 'k': // Pause
          videoRef.current?.pause();
          setIsPlaying(false);
          break;
        case 'l': // Fast forward
          if (videoRef.current) videoRef.current.currentTime = Math.min(endTime, videoRef.current.currentTime + 2);
          break;
        case 'i': // Set in point
          setStartTime(currentTime);
          onTrimChange(currentTime, endTime);
          triggerHaptic('light');
          break;
        case 'o': // Set out point
          setEndTime(currentTime);
          onTrimChange(startTime, currentTime);
          triggerHaptic('light');
          break;
        case 'arrowleft':
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.1);
          break;
        case 'arrowright':
          if (videoRef.current) videoRef.current.currentTime = Math.min(durationSeconds, videoRef.current.currentTime + 0.1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, startTime, endTime, isPlaying, durationSeconds, onTrimChange, triggerHaptic]);

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const startPercent = (startTime / (durationSeconds || 1)) * 100;
  const endPercent = (endTime / (durationSeconds || 1)) * 100;
  const playheadPercent = (currentTime / (durationSeconds || 1)) * 100;

  return (
    <div className={`p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-5 ${className}`}>
      {/* Video Preview */}
      <div className="relative aspect-video max-h-72 w-full mx-auto overflow-hidden rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
        <video
          ref={videoRef}
          src={mediaSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="h-full w-full object-contain"
          playsInline
        />

        {/* Center Play Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white group-hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </div>
        </button>
      </div>

      {/* Timecode Displays */}
      <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
        <div>
          Start (I): <strong className="text-cyan-400">{formatTimecode(startTime)}</strong>
        </div>
        <div className="text-white font-bold text-sm">
          Current: {formatTimecode(currentTime)}
        </div>
        <div>
          End (O): <strong className="text-cyan-400">{formatTimecode(endTime)}</strong>
        </div>
      </div>

      {/* Timeline Strip */}
      <div
        ref={timelineRef}
        onClick={(e) => {
          if (!timelineRef.current || !videoRef.current) return;
          const rect = timelineRef.current.getBoundingClientRect();
          const clickPercent = (e.clientX - rect.left) / rect.width;
          const newTime = clickPercent * durationSeconds;
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }}
        className="relative h-14 w-full rounded-xl bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer select-none"
      >
        {/* Mock Video Frame Thumbnail Strip */}
        <div className="absolute inset-0 flex items-center justify-between opacity-30 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-full w-12 border-r border-white/5 bg-gradient-to-b from-white/10 to-transparent" />
          ))}
        </div>

        {/* Trim Active Range Highlight */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500/20 border-y-2 border-cyan-400"
          style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
        />

        {/* Left Cut Handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-cyan-400 rounded-l cursor-ew-resize flex items-center justify-center shadow-lg"
          style={{ left: `${startPercent}%` }}
        >
          <div className="h-4 w-[1px] bg-black/60" />
        </div>

        {/* Right Cut Handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-cyan-400 rounded-r cursor-ew-resize flex items-center justify-center shadow-lg"
          style={{ left: `calc(${endPercent}% - 12px)` }}
        >
          <div className="h-4 w-[1px] bg-black/60" />
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-[0_0_8px_#fff]"
          style={{ left: `${playheadPercent}%` }}
        />
      </div>

      {/* Trim Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium">Cut Engine:</span>
          <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode('lossless');
                onTrimChange(startTime, endTime, 'lossless');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                mode === 'lossless'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lossless Fast
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('precise');
                onTrimChange(startTime, endTime, 'precise');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                mode === 'precise'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Frame-Accurate
            </button>
          </div>
        </div>
        <span className="text-[11px] text-zinc-500">
          {mode === 'lossless'
            ? '⚡ Instant cut (nearest keyframe, zero re-encode).'
            : '🎯 Exact frame cut (re-encodes boundary frames).'
          }
        </span>
      </div>

      {/* Controls & Keyboard Hints */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <CupertinoButton size="sm" variant="secondary" onClick={togglePlay}>
            {isPlaying ? 'Pause' : 'Play'} (Space)
          </CupertinoButton>
          <CupertinoButton
            size="sm"
            variant="ghost"
            onClick={() => {
              setStartTime(0);
              setEndTime(durationSeconds);
              onTrimChange(0, durationSeconds);
            }}
          >
            Reset Trim
          </CupertinoButton>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          <span>Shortcuts:</span>
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">Space</kbd>
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">J/K/L</kbd>
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">I (In)</kbd>
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">O (Out)</kbd>
        </div>
      </div>
    </div>
  );
}
