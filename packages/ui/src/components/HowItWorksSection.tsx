'use client';

import React from 'react';
import { UploadCloud, Cpu, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Drop & Instant Probe',
      desc: 'Drag any audio, video, or image file. The client inspects real binary magic bytes and extracts streams in under 50ms.',
      icon: UploadCloud,
      badge: 'Zero Upload Latency',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      num: '02',
      title: 'Hybrid Engine Router',
      desc: 'Our 5-factor heuristic routes lightweight jobs to in-browser WebAssembly, or demanding codecs (AV1, HEVC) to our high-speed cloud cluster.',
      icon: Cpu,
      badge: 'Privacy-First Architecture',
      gradient: 'from-cyan-500/20 to-emerald-500/10',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      num: '03',
      title: 'Stream & Direct Save',
      desc: 'Watch real-time frame progress. Download your optimized file instantly, export to social sizes, or bundle multi-file batches into a ZIP.',
      icon: Download,
      badge: '1-Click Direct Download',
      gradient: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
          <span>WORKFLOW BLUEPRINT</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Transcode media in three effortless steps.
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-400">
          Engineered for creative professionals and daily users. No file size traps, no watermark delays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className={`relative rounded-3xl bg-zinc-900/60 border ${step.border} p-6 sm:p-8 backdrop-blur-xl overflow-hidden group hover:border-white/20 transition-all duration-300`}
            >
              {/* Background Ambient Glow */}
              <div
                className={`absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${step.gradient} blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
              />

              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-mono font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {step.num}
                </span>
                <div className={`p-3 rounded-2xl bg-white/[0.04] border border-white/10 ${step.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.05] border border-white/10 text-zinc-300 mb-3">
                {step.badge}
              </div>

              <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
