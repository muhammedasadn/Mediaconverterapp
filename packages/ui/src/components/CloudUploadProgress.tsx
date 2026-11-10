'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, Wifi } from 'lucide-react';
import { springTokens } from '../motion/tokens';

export interface CloudUploadProgressProps {
  uploadPercent: number;
  speedMbps?: number;
  filename: string;
  className?: string;
}

export function CloudUploadProgress({
  uploadPercent,
  speedMbps = 18.4,
  filename,
  className = '',
}: CloudUploadProgressProps) {
  return (
    <div className={`p-4 rounded-2xl bg-white/[0.04] border border-blue-500/20 backdrop-blur-2xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CloudUpload className="h-4 w-4 text-cyan-400 animate-bounce" />
          <span className="font-semibold text-white">Streaming to Cloud Cluster</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
          <Wifi className="h-3 w-3" />
          <span>~{speedMbps.toFixed(1)} MB/s</span>
        </div>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-md shadow-cyan-400/50"
          initial={{ width: 0 }}
          animate={{ width: `${uploadPercent}%` }}
          transition={springTokens.snappy}
        />
      </div>

      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
        <span className="truncate max-w-[200px]">{filename}</span>
        <span>{Math.round(uploadPercent)}% uploaded</span>
      </div>
    </div>
  );
}
