'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { CupertinoButton } from './CupertinoButton';
import { useHapticFeedback } from '../motion/hooks';

export interface ConversionResultCardProps {
  outputFilename: string;
  outputSizeBytes: number;
  originalSizeBytes: number;
  downloadUrl: string;
  engineUsed: 'device' | 'cloud';
  onReset: () => void;
  className?: string;
}

export function ConversionResultCard({
  outputFilename,
  outputSizeBytes,
  originalSizeBytes,
  downloadUrl,
  engineUsed,
  onReset,
  className = '',
}: ConversionResultCardProps) {
  const { triggerHaptic } = useHapticFeedback();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const savingsPercent = Math.max(
    0,
    Math.round(((originalSizeBytes - outputSizeBytes) / originalSizeBytes) * 100)
  );

  const handleShare = async () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: outputFilename,
          text: `Converted with Universal Media Converter (${formatBytes(outputSizeBytes)})`,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springTokens.bouncy}
      className={`relative overflow-hidden rounded-[28px] border border-white/20 bg-neutral-900/90 p-6 sm:p-10 backdrop-blur-3xl text-center shadow-2xl ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), 0 24px 48px -12px rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Animated Checkmark Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={springTokens.bouncy}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-400/30 text-emerald-400 shadow-lg shadow-emerald-500/20"
      >
        <CheckCircle2 className="h-9 w-9 text-emerald-400" />
      </motion.div>

      <h3 className="text-2xl font-bold text-white mb-1">Conversion Complete!</h3>
      <p className="text-xs sm:text-sm text-neutral-400 font-mono mb-6">{outputFilename}</p>

      {/* Comparison Pill */}
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 mb-8 font-mono text-xs">
        <span className="text-neutral-400">
          Source: <strong className="text-white">{formatBytes(originalSizeBytes)}</strong>
        </span>
        <span className="text-neutral-500">→</span>
        <span className="text-neutral-400">
          Output: <strong className="text-cyan-400">{formatBytes(outputSizeBytes)}</strong>
        </span>
        {savingsPercent > 0 && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
            <Sparkles className="h-3 w-3" />
            -{savingsPercent}%
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={downloadUrl} download={outputFilename} className="w-full sm:w-auto">
          <CupertinoButton
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            leftIcon={<Download className="h-5 w-5" />}
          >
            Download Converted File
          </CupertinoButton>
        </a>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <CupertinoButton
            variant="secondary"
            size="lg"
            onClick={handleShare}
            leftIcon={<Share2 className="h-4 w-4" />}
          >
            Share
          </CupertinoButton>
        )}

        <CupertinoButton
          variant="ghost"
          size="lg"
          onClick={onReset}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Convert Another
        </CupertinoButton>
      </div>
    </motion.div>
  );
}
