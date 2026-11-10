'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube,
  Search,
  ExternalLink,
  Download,
  ShieldCheck,
  Music,
  Video,
  FileCheck,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { parseYouTubeUrl } from '@universal/conversion-core';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';

export interface YouTubeHelperStudioProps {
  onFileDropToConvert?: (file: File) => void;
  onNavigateToImport?: (url: string) => void;
  className?: string;
}

export function YouTubeHelperStudio({
  onFileDropToConvert,
  onNavigateToImport,
  className = '',
}: YouTubeHelperStudioProps) {
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'my-video' | 'free-audio' | 'permission'>('my-video');
  const [previewVideo, setPreviewVideo] = useState<{
    videoId: string;
    canonicalUrl: string;
    title?: string;
    thumbnailUrl?: string;
    channel?: string;
  } | null>(null);

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    if (!val.trim()) {
      setPreviewVideo(null);
      return;
    }

    const parsed = parseYouTubeUrl(val);
    if (parsed.isValid && parsed.videoId) {
      setPreviewVideo({
        videoId: parsed.videoId,
        canonicalUrl: parsed.canonicalUrl || `https://www.youtube.com/watch?v=${parsed.videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg`,
        title: `YouTube Video (${parsed.videoId})`,
      });
    } else {
      setPreviewVideo(null);
    }
  };

  return (
    <div className={`p-6 sm:p-8 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-500/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">YouTube Creator Helper</h3>
            <p className="text-xs text-zinc-400">Legitimate workflows for your channel videos & royalty-free music</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official Studio & CC Workflows</span>
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
            className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white text-sm outline-none placeholder:text-zinc-500 font-sans focus:border-red-500/50 transition-colors"
          />
        </div>
      </div>

      {/* oEmbed Preview Card */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={springTokens.snappy}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-red-500/20 flex flex-col sm:flex-row items-center gap-4"
          >
            {previewVideo.thumbnailUrl && (
              <img
                src={previewVideo.thumbnailUrl}
                alt="Video Thumbnail"
                className="w-36 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs font-mono text-red-400 font-semibold uppercase">Official YouTube Video Detected</div>
              <div className="text-sm font-bold text-white truncate">{previewVideo.title}</div>
              <div className="text-[11px] text-zinc-400 font-mono truncate">{previewVideo.canonicalUrl}</div>
            </div>
            <a
              href={previewVideo.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <span>Watch</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three Guided Path Tabs */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Choose Your Goal:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 rounded-2xl bg-black/40 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('my-video')}
            className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'my-video'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. My Own Channel Video
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('free-audio')}
            className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'free-audio'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Royalty-Free Music & CC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permission')}
            className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'permission'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3. Creator Collaboration
          </button>
        </div>

        {/* Tab 1 Content: My Own Video Guide */}
        {activeTab === 'my-video' && (
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                How to Export Your High-Quality Video from YouTube Studio
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                YouTube provides an official, 1-click download tool for every video you upload:
              </p>
            </div>

            <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2 pl-1 font-sans">
              <li>Open <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">studio.youtube.com</a> and sign in to your channel.</li>
              <li>Click <strong>Content</strong> in the left sidebar menu.</li>
              <li>Hover your cursor over the video, click the <strong>three dots (⋮)</strong> menu.</li>
              <li>Select <strong>Download</strong> to save the original high-definition MP4 file.</li>
            </ol>

            <div className="pt-2">
              <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] text-center space-y-2">
                <div className="text-xs text-zinc-300 font-medium">
                  Once downloaded, drop your MP4 file here to convert to MP3, trim, or compress:
                </div>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFileDropToConvert?.(f);
                  }}
                  className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Royalty-Free & CC Music */}
        {activeTab === 'free-audio' && (
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Authorized Royalty-Free Music & Audio Libraries
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Looking for background music or sound effects for your videos? Use these 100% legal, copyright-cleared platforms:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href="https://studio.youtube.com/channel/videos/music"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 text-xs text-zinc-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">YouTube Audio Library</div>
                  <div className="text-[10px] text-zinc-400">Thousands of free tracks & SFX</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>

              <a
                href="https://commons.wikimedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 text-xs text-zinc-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">Wikimedia Commons</div>
                  <div className="text-[10px] text-zinc-400">Public domain & Creative Commons audio</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 3 Content: Creator Permission */}
        {activeTab === 'permission' && (
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              Collaborating with Other Creators
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If another creator granted you permission to remix or edit their content, always ask them to send the original camera master or WAV file directly (via Google Drive, WeTransfer, or Dropbox). Stream extraction lowers audio quality to 128kbps, whereas master files give you pristine studio sound.
            </p>
          </div>
        )}
      </div>

      {/* Compliance Guarantee Footer */}
      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 gap-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          Universal Media Converter respects creator copyright and does not download or rip third-party streams.
        </span>
        <span className="text-zinc-600 font-mono">Terms of Service Compliant</span>
      </div>
    </div>
  );
}
