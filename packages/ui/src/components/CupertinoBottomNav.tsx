'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Video, Sparkles, Scissors, Layers, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const CupertinoBottomNav: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: 'Convert', icon: Video },
    { href: '/compress', label: 'Compress', icon: Sparkles },
    { href: '/edit', label: 'Trim', icon: Scissors },
    { href: '/batch', label: 'Batch', icon: Layers },
    { href: '/history', label: 'History', icon: Clock },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40">
      <div className="bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
