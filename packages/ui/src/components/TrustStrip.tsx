'use client';

import React from 'react';
import { ShieldCheck, Zap, WifiOff, Sparkles } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: '100% Private by Design',
      desc: 'Processed directly in your browser when possible.',
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      desc: 'Core WebAssembly engines run without internet.',
    },
    {
      icon: Zap,
      title: 'Zero Latency & Free',
      desc: 'No account required, no file size paywalls.',
    },
    {
      icon: Sparkles,
      title: 'High-Speed Cloud Turbo',
      desc: 'Native FFmpeg 7.x cluster for AV1, HEVC & 4K.',
    },
  ];

  return (
    <div className="w-full py-6 border-y border-white/[0.06] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white tracking-tight">{pt.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{pt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
