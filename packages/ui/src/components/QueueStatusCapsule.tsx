'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Cpu, Activity } from 'lucide-react';
import { springTokens } from '../motion/tokens';

export interface QueueStatusCapsuleProps {
  queuePosition?: number;
  workerCluster?: string;
  className?: string;
}

export function QueueStatusCapsule({
  queuePosition = 1,
  workerCluster = 'Cluster US-East (4 Cores)',
  className = '',
}: QueueStatusCapsuleProps) {
  return (
    <motion.div
      layout
      transition={springTokens.snappy}
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 backdrop-blur-2xl text-xs text-neutral-200 shadow-xl shadow-blue-500/10 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
      </span>

      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="font-semibold text-cyan-300">
          Queue: #{queuePosition} in line
        </span>
        <span className="text-neutral-500">•</span>
        <span className="text-neutral-400 flex items-center gap-1">
          <Cpu className="h-3 w-3 text-blue-400" />
          {workerCluster}
        </span>
      </div>
    </motion.div>
  );
}
