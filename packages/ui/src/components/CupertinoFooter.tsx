'use client';

import React from 'react';
import Link from 'next/link';
import { Video, Github, Shield, Heart } from 'lucide-react';

export const CupertinoFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-zinc-950/80 backdrop-blur-2xl py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-white tracking-tight">
                Universal Media Converter
              </span>
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-4">
              Enterprise-grade media transcoding, target size compression, and editing studio.
              Designed with Cupertino glassmorphism, powered by WebAssembly and native cloud FFmpeg 7.x.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hybrid Engine Cluster: 100% Operational</span>
            </div>
          </div>

          {/* Col 2: Studio Tools */}
          <div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Studio Tools
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Universal Converter
                </Link>
              </li>
              <li>
                <Link href="/compress" className="hover:text-blue-400 transition-colors">
                  Target Size Compressor
                </Link>
              </li>
              <li>
                <Link href="/edit" className="hover:text-blue-400 transition-colors">
                  Sub-Frame Video Editor
                </Link>
              </li>
              <li>
                <Link href="/batch" className="hover:text-blue-400 transition-colors">
                  Batch Queue Studio
                </Link>
              </li>
              <li>
                <Link href="/audio-to-video" className="hover:text-blue-400 transition-colors">
                  Audio-to-Video Visualizer
                </Link>
              </li>
              <li>
                <Link href="/info" className="hover:text-blue-400 transition-colors">
                  Media Stream Inspector
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Privacy */}
          <div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Platform & Specs
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/history" className="hover:text-blue-400 transition-colors">
                  Conversion History
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-blue-400 transition-colors">
                  iOS Grouped Settings
                </Link>
              </li>
              <li>
                <Link href="/dev/motion" className="hover:text-blue-400 transition-colors">
                  Motion Design Tokens
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/muhammedasadn/Mediaconverterapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center space-x-1">
            <span>Built with precision for creators. Open Source MIT License.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Privacy Guaranteed
            </span>
            <span className="font-mono text-[10px] text-zinc-600">v1.0.0-PRO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
