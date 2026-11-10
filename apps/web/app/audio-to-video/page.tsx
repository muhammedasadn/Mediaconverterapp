'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '../../components/AppHeader';
import { MobileTabBar } from '../../components/MobileTabBar';
import {
  DropZonePrimitive,
  AudioToVideoStudio,
  AudioToVideoConfig,
  ConversionProgressCard,
  ConversionResultCard,
} from '@universal/ui';
import { ArrowLeft, Music, Sparkles } from 'lucide-react';
import { WasmBrowserEngine } from '@universal/conversion-core';
import { ConversionRequest } from '@universal/job-contracts';

export default function AudioToVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleExport = async (config: AudioToVideoConfig) => {
    if (!file) return;

    setIsExporting(true);
    setProgress(15);

    const engine = new WasmBrowserEngine();
    const req: ConversionRequest = {
      id: crypto.randomUUID(),
      inputFilename: file.name,
      inputSizeBytes: file.size,
      inputMimeType: file.type,
      targetFormat: 'mp4',
      preset: 'best',
      enginePreference: 'device',
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await engine.convert(file, req, (p) => {
        setProgress(p.progressPercent);
      });

      const url = URL.createObjectURL(result.outputBlob);
      setResultUrl(url);
      setIsExporting(false);
    } catch {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 font-semibold">
            Audio-to-Video Studio
          </span>
        </div>

        {!file ? (
          <div className="py-12 space-y-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Turn Podcasts & Songs into Viral Video Visualizers
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
              Drop any MP3, WAV, or AAC audio file. Add waveforms, cover art, track titles, and export 1080p video ready for YouTube, TikTok, and Reels.
            </p>
            <div className="max-w-2xl mx-auto pt-4">
              <DropZonePrimitive accept="audio/*" onFileSelect={(f) => setFile(f)} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!resultUrl && !isExporting && (
              <AudioToVideoStudio
                audioFileName={file.name}
                onExportVideo={handleExport}
              />
            )}

            {isExporting && (
              <ConversionProgressCard
                filename={file.name}
                progressPercent={progress}
                stage="Rendering audio waveform frames into 1080p MP4..."
                engineUsed="device"
                onCancel={() => setIsExporting(false)}
              />
            )}

            {resultUrl && (
              <ConversionResultCard
                outputFilename={`video_${file.name.replace(/\.[^/.]+$/, '')}.mp4`}
                outputSizeBytes={Math.round(file.size * 2.5)}
                originalSizeBytes={file.size}
                downloadUrl={resultUrl}
                engineUsed="device"
                onReset={() => {
                  setResultUrl(null);
                  setFile(null);
                }}
              />
            )}
          </div>
        )}
      </main>

      <MobileTabBar />
    </div>
  );
}
