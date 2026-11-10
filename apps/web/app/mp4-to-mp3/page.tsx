'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DropZonePrimitive, GlassCard, CupertinoButton, QualityOptionPicker } from '@universal/ui';
import { ArrowLeft, Music, CheckCircle2, ShieldCheck, Sparkles, Download, RotateCcw } from 'lucide-react';
import { WasmBrowserEngine, formatBytes } from '@universal/conversion-core';

export default function Mp4ToMp3Page() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState('Idle');
  const [downloadResult, setDownloadResult] = useState<{ url: string; filename: string; size: string } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setDownloadResult(null);
  };

  const handleSelectAndDownload = async (selection: {
    category: 'video' | 'audio';
    format: string;
    qualityId: string;
    bitrateKbps?: number;
    estimatedBytes: number;
  }) => {
    if (!file) return;

    setIsProcessing(true);
    setProgressPercent(15);
    setStageMessage('Initializing on-device WebAssembly audio engine...');

    const engine = new WasmBrowserEngine();
    const req = {
      id: crypto.randomUUID(),
      inputFilename: file.name,
      inputSizeBytes: file.size,
      inputMimeType: file.type || 'video/mp4',
      targetFormat: selection.format,
      preset: 'balanced' as const,
      enginePreference: 'device' as const,
      audio: {
        bitrateKbps: selection.bitrateKbps || 192,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      let lastTick = 0;
      const result = await engine.convert(file, req, (p) => {
        const now = Date.now();
        if (p.progressPercent === 100 || p.progressPercent <= 15 || now - lastTick >= 80) {
          lastTick = now;
          setProgressPercent(p.progressPercent);
          setStageMessage(p.stage);
        }
      });

      const blobUrl = URL.createObjectURL(result.outputBlob);
      setDownloadResult({
        url: blobUrl,
        filename: result.outputFilename,
        size: formatBytes(result.outputSizeBytes),
      });
      setIsProcessing(false);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400 font-semibold">
            MP4 → MP3 Converter
          </span>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Convert MP4 to MP3 Audio
          </h1>
          <p className="text-sm text-neutral-400">
            Extract high-fidelity MP3, AAC, or lossless WAV from your MP4 videos with zero cloud upload wait.
          </p>
        </div>

        {/* Dropzone or Audio Quality Studio */}
        {!file ? (
          <div className="space-y-4">
            <DropZonePrimitive
              onFileSelect={handleFileSelect}
              accept="video/mp4,video/*"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-side. Your videos never leave your device.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <GlassCard intensity="medium" className="p-4 sm:p-6 rounded-3xl border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{file.name}</h3>
                  <p className="text-xs text-neutral-400">{formatBytes(file.size)} · MP4 Video Container</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setDownloadResult(null);
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Change File
              </button>
            </GlassCard>

            {/* Quality Picker & Download */}
            {!downloadResult ? (
              <GlassCard intensity="deep" className="p-6 rounded-3xl border-white/10">
                <QualityOptionPicker
                  mediaCategory="audio"
                  durationSeconds={180}
                  originalSizeBytes={file.size}
                  isProcessing={isProcessing}
                  progressPercent={progressPercent}
                  stageMessage={stageMessage}
                  onSelectAndDownload={handleSelectAndDownload}
                  onTrimFirst={() => router.push('/edit')}
                  onCompress={() => router.push('/compress')}
                  onOpenAdvanced={() => router.push('/')}
                />
              </GlassCard>
            ) : (
              <GlassCard intensity="deep" className="p-6 sm:p-8 rounded-3xl border-emerald-500/30 space-y-6">
                <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>MP3 Audio Extracted Successfully!</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-medium">{downloadResult.filename}</span>
                  <span className="text-cyan-300 font-bold">{downloadResult.size}</span>
                </div>

                <div className="flex items-center gap-3">
                  <a href={downloadResult.url} download={downloadResult.filename} className="w-full">
                    <CupertinoButton
                      variant="primary"
                      size="lg"
                      className="w-full text-base font-bold shadow-xl shadow-emerald-500/20"
                      leftIcon={<Download className="w-5 h-5" />}
                    >
                      Save {downloadResult.filename}
                    </CupertinoButton>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setDownloadResult(null);
                    }}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Another</span>
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
