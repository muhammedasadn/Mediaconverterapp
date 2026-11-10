'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Wrench, History, Settings } from 'lucide-react';
import { springTokens } from '@universal/ui';

export function MobileTabBar() {
  const [activeTab, setActiveTab] = useState<'convert' | 'tools' | 'history' | 'settings'>('convert');

  const tabs = [
    { id: 'convert', label: 'Convert', icon: RefreshCw },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-white/10 bg-neutral-950/80 backdrop-blur-3xl px-4 py-2 pb-6">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-neutral-400'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    transition={springTokens.snappy}
                    className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-sm -z-10"
                  />
                )}
              </div>
              <span className={isActive ? 'text-white font-semibold' : 'text-neutral-400'}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
