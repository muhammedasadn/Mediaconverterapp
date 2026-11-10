'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DropZonePrimitive, GlassCard, CupertinoButton } from '@universal/ui';
import { ArrowLeft, ArrowRight, Music, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function YouTubeMp4ToMp3Page() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400 font-semibold">
            MP4 → MP3 High-Speed Extractor
          </span>
        </div>

        {/* Hero Info */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Extract MP3 Audio from Your Video
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Exported your video from YouTube Studio? Drop your MP4 here to extract 320kbps MP3 audio directly in your browser with zero upload wait.
          </p>
        </div>

        {/* Dropzone */}
        {!file ? (
          <DropZonePrimitive
            onFilesSelected={(files) => {
              if (files[0]) setFile(files[0]);
            }}
            accept={{ 'video/mp4': ['.mp4'], 'video/*': ['.mov', '.mkv', '.webm'] }}
          />
        ) : (
          <GlassCard intensity="strong" className="p-6 rounded-3xl border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{file.name}</div>
                  <div className="text-xs text-zinc-400">{(file.size / (1024 * 1024)).toFixed(1)} MB · Ready for MP3 conversion</div>
                </div>
              </div>
              <CupertinoButton
                variant="primary"
                onClick={() => router.push('/')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start MP3 Extraction
              </CupertinoButton>
            </div>
          </GlassCard>
        )}

        {/* Trust & Privacy Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-zinc-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>
            100% on-device processing via WebAssembly. Your videos never leave your browser when converting locally.
          </span>
        </div>
      </main>
    </div>
  );
}
