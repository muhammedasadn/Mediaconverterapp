'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is Universal Media Converter truly free and private?',
      a: 'Yes, absolutely. There are zero subscription walls, zero watermarks, and no sign-up required. Conversions that run on your device via WebAssembly never send a single byte over the network.',
    },
    {
      q: 'What is the difference between "Device Engine" and "Cloud Turbo"?',
      a: 'Device Engine executes FFmpeg.wasm right inside your browser Web Worker thread. For demanding codecs (AV1, H.265/HEVC, Apple ProRes) or files larger than 100MB (or 35MB on mobile), Cloud Turbo routes the job to our 64-core native FFmpeg 7.x cluster to avoid draining your battery or crashing browser tabs.',
    },
    {
      q: 'How long are temporary files kept on the cloud server?',
      a: 'All temporary files on the cloud cluster are strictly protected by a 1-hour automated rolling eviction policy. Once the TTL expires, files are unlinked and permanently deleted.',
    },
    {
      q: 'Can I install this on my iPhone, iPad, or Android device?',
      a: 'Yes! Universal Media Converter is a certified Progressive Web App (PWA). Tap "Share" → "Add to Home Screen" on iOS Safari or click the install prompt in Chrome to install it as a standalone app.',
    },
    {
      q: 'Does it work without an internet connection?',
      a: 'Yes! Once loaded, our service worker caches the application shell and core WebAssembly binaries so you can convert common audio and video formats even while completely offline.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Everything you need to know.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Transparent answers about our hybrid architecture, privacy model, and performance.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-900/50 border border-white/[0.06] overflow-hidden backdrop-blur-xl transition-colors hover:border-white/10"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-medium text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-3 ${
                    isOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
