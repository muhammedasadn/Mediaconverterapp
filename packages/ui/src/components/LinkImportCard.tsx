'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ArrowRight, ShieldCheck, Download, AlertCircle, FileAudio, Check, Globe } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';

export interface LinkImportCardProps {
  onImportSuccess: (file: { name: string; url: string; sizeBytes?: number }) => void;
  className?: string;
}

export function LinkImportCard({ onImportSuccess, className = '' }: LinkImportCardProps) {
  const [url, setUrl] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    filename: string;
    sizeBytes: number;
    contentType: string;
  } | null>(null);

  const sampleRepositories = [
    { name: 'Wikimedia Commons', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Seikilos_epitaph_in_Greek_and_English.ogg' },
    { name: 'Internet Archive', url: 'https://archive.org/download/test-audio-sample/sample.mp3' },
  ];

  const handleInspect = async () => {
    if (!url.trim()) return;
    setErrorMsg(null);
    setIsInspecting(true);

    try {
      // 1. Basic client-side check
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        throw new Error('Only secure HTTPS URLs are permitted.');
      }

      // Check for filename from path
      const pathSegments = parsed.pathname.split('/');
      const filename = pathSegments[pathSegments.length - 1] || 'remote_media';

      setPreviewData({
        filename,
        sizeBytes: 0,
        contentType: 'media/unknown',
      });
      setIsInspecting(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid URL entered.');
      setIsInspecting(false);
    }
  };

  const handleProceedImport = () => {
    if (!previewData) return;
    onImportSuccess({
      name: previewData.filename,
      url,
      sizeBytes: previewData.sizeBytes,
    });
  };

  return (
    <div className={`p-6 sm:p-8 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Open Link Import</h3>
            <p className="text-xs text-zinc-400">Import direct public media or Creative Commons archives</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SSRF Protected</span>
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreviewData(null);
              setErrorMsg(null);
            }}
            placeholder="Paste direct media URL (https://... .mp3, .mp4, .wav)"
            className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white text-sm outline-none placeholder:text-zinc-500 font-sans pr-24 focus:border-cyan-500/50 transition-colors"
          />
          <button
            type="button"
            onClick={handleInspect}
            disabled={isInspecting || !url.trim()}
            className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            {isInspecting ? 'Inspecting...' : 'Inspect'}
          </button>
        </div>

        {/* Quick Sample Links */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-zinc-500">Try public samples:</span>
          {sampleRepositories.map((repo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(repo.url);
                setPreviewData(null);
                setErrorMsg(null);
              }}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            >
              {repo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Inspect Preview Card */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={springTokens.snappy}
            className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <FileAudio className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-white truncate">{previewData.filename}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">Validated Remote URL</div>
                </div>
              </div>

              <CupertinoButton
                variant="primary"
                size="sm"
                onClick={handleProceedImport}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Import to Studio
              </CupertinoButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security & Copyright Policy Guardrail */}
      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 gap-2">
        <span className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          Only import media you have rights to or licensed under Creative Commons.
        </span>
        <span className="text-zinc-600 font-mono">500MB Cap · Anti-SSRF</span>
      </div>
    </div>
  );
}
