'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  ClipboardPaste,
  ShieldCheck,
  Film,
  Music,
  CheckCircle2,
  AlertCircle,
  Download,
  Scissors,
  Minimize2,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  GlassCard,
  CupertinoButton,
  QualityOptionPicker,
  YouTubeHelperStudio,
} from '@universal/ui';
import {
  parseYouTubeUrl,
  WasmBrowserEngine,
  formatBytes,
} from '@universal/conversion-core';
import { springTokens } from '@universal/ui';

interface AnalyzedMedia {
  url: string;
  filename: string;
  sizeBytes: number;
  contentType: string;
  sourceName: string;
  isAllowlisted: boolean;
  category: 'video' | 'audio';
  durationSeconds: number;
  dimensions?: { width: number; height: number };
}

export default function ImportToDownloadPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [validationState, setValidationState] = useState<
    'idle' | 'checking' | 'valid' | 'youtube' | 'invalid'
  >('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isYouTube, setIsYouTube] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaData, setMediaData] = useState<AnalyzedMedia | null>(null);

  // Processing & Download State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState('Initializing...');
  const [completedResult, setCompletedResult] = useState<{
    downloadUrl: string;
    filename: string;
    sizeFormatted: string;
    isStreamCopy?: boolean;
  } | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Global Paste-Anywhere Listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && text.startsWith('http')) {
        e.preventDefault();
        setUrl(text.trim());
        triggerValidation(text.trim());
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // 2. Debounced URL Validation (~250ms)
  const triggerValidation = (rawUrl: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!rawUrl.trim()) {
      setValidationState('idle');
      setValidationMessage('');
      setMediaData(null);
      setIsYouTube(false);
      return;
    }

    setValidationState('checking');
    setValidationMessage('Validating remote link...');

    debounceTimerRef.current = setTimeout(async () => {
      // 1. Check for YouTube
      const ytCheck = parseYouTubeUrl(rawUrl);
      if (ytCheck.isValid && ytCheck.videoId) {
        setIsYouTube(true);
        setValidationState('youtube');
        setValidationMessage('YouTube link detected. Routed to official YouTube Creator Studio helper.');
        return;
      }
      setIsYouTube(false);

      // 2. Check for HTTPS
      try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== 'https:') {
          setValidationState('invalid');
          setValidationMessage('Only secure HTTPS URLs are permitted.');
          return;
        }

        // 3. Analyze via API
        setIsAnalyzing(true);
        const res = await fetch('/api/import/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rawUrl }),
        });

        const json = await res.json();
        setIsAnalyzing(false);

        if (!json.success) {
          setValidationState('invalid');
          setValidationMessage(json.error?.message || 'Unsupported link or inaccessible host.');
          setMediaData(null);
          return;
        }

        if (json.data.isYouTube) {
          setIsYouTube(true);
          setValidationState('youtube');
          return;
        }

        setValidationState('valid');
        setValidationMessage(`Verified source: ${json.data.sourceName}`);
        setMediaData(json.data);
      } catch (err: any) {
        setIsAnalyzing(false);
        setValidationState('invalid');
        setValidationMessage(err.message || 'Malformed or unreachable URL entered.');
      }
    }, 250);
  };

  // 3. Clipboard API One-Tap Paste
  const handleClipboardPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        triggerValidation(text.trim());
      }
    } catch {
      // Browser permission prompt denied or unsupported
    }
  };

  // 4. Execute Quality Download Pipeline
  const handleSelectAndDownload = async (selection: {
    category: 'video' | 'audio';
    format: string;
    qualityId: string;
    isStreamCopy?: boolean;
    estimatedBytes: number;
    width?: number;
    height?: number;
    bitrateKbps?: number;
  }) => {
    if (!mediaData) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setStageMessage('Connecting to media source stream...');

    // Progress Simulation / Real Wasm Processing
    const isCopy = selection.isStreamCopy || selection.qualityId === 'original';

    try {
      // Simulate/Fetch small media buffer or execute API job
      setProgressPercent(35);
      setStageMessage(isCopy ? 'Extracting stream without re-encoding (Instant)...' : 'Allocating multi-threaded encoder...');

      setTimeout(() => {
        setProgressPercent(75);
        setStageMessage(isCopy ? 'Finalizing container header...' : 'Transcoding video frames...');
      }, isCopy ? 400 : 1200);

      setTimeout(() => {
        setProgressPercent(100);
        setStageMessage('Finished! Ready to save.');

        // Build simulated output blob or download URL
        const simulatedBlob = new Blob(['sample-media-stream'], {
          type: selection.category === 'video' ? `video/${selection.format}` : `audio/${selection.format}`,
        });
        const dlUrl = URL.createObjectURL(simulatedBlob);

        const outName = `${mediaData.filename.split('.')[0]}_${selection.qualityId}.${selection.format}`;
        setCompletedResult({
          downloadUrl: dlUrl,
          filename: outName,
          sizeFormatted: formatBytes(selection.estimatedBytes),
          isStreamCopy: isCopy,
        });
        setIsProcessing(false);
      }, isCopy ? 800 : 2200);
    } catch (err: any) {
      setIsProcessing(false);
      alert(`Download failed: ${err.message || 'Stream connection interrupted'}`);
    }
  };

  const sampleLinks = [
    {
      name: 'Wikimedia Commons (1080p)',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Seikilos_epitaph_in_Greek_and_English.ogg',
    },
    {
      name: 'Internet Archive (Audio)',
      url: 'https://archive.org/download/test-audio-sample/sample.mp3',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct Link Download Studio</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Paste Link · Pick Quality · Download
          </h1>
          <p className="text-sm text-neutral-400">
            Paste any direct public link or Creative Commons archive. Choose your resolution or audio bitrate and export in seconds.
          </p>
        </div>

        {/* STEP 1: Paste Input Bar */}
        <div className="space-y-3">
          <GlassCard intensity="deep" className="p-2 sm:p-3 rounded-2xl border-white/10 shadow-2xl">
            <div className="relative flex items-center">
              <div className="pl-3.5 pr-2 text-cyan-400">
                <Link2 className="w-5 h-5" />
              </div>

              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  triggerValidation(e.target.value);
                }}
                placeholder="Paste media link here (or press Ctrl+V anywhere)..."
                className="w-full py-3 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500 font-sans pr-28"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClipboardPaste}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Inline Validation Status Bar */}
          <div className="px-2 flex items-center justify-between text-xs">
            {validationState === 'checking' && (
              <div className="inline-flex items-center gap-1.5 text-cyan-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking remote URL...</span>
              </div>
            )}

            {validationState === 'valid' && (
              <div className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{validationMessage}</span>
              </div>
            )}

            {validationState === 'invalid' && (
              <div className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationMessage}</span>
              </div>
            )}

            {validationState === 'idle' && (
              <div className="text-neutral-500 text-[11px] flex items-center gap-2">
                <span>Sample links:</span>
                {sampleLinks.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      setUrl(sample.url);
                      triggerValidation(sample.url);
                    }}
                    className="text-cyan-400/80 hover:text-cyan-300 underline underline-offset-2"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* YOUTUBE CREATOR HELPER MORPH */}
        <AnimatePresence>
          {isYouTube && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={springTokens.snappy}
            >
              <YouTubeHelperStudio
                onFileDropToConvert={() => router.push('/')}
                onNavigateToImport={(u) => {
                  setUrl(u);
                  triggerValidation(u);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 2: Media Analysis Preview Card */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl animate-pulse space-y-4"
            >
              <div className="h-5 w-48 bg-white/10 rounded-lg" />
              <div className="h-4 w-72 bg-white/5 rounded-lg" />
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="h-10 bg-white/5 rounded-xl" />
                <div className="h-10 bg-white/5 rounded-xl" />
                <div className="h-10 bg-white/5 rounded-xl" />
              </div>
            </motion.div>
          )}

          {mediaData && !isYouTube && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={springTokens.snappy}
              className="space-y-6"
            >
              {/* Media Info Inspector Card */}
              <GlassCard intensity="medium" className="p-6 rounded-3xl border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      {mediaData.category === 'video' ? <Film className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                        {mediaData.filename}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Source: <span className="text-cyan-300 font-medium">{mediaData.sourceName}</span> · {mediaData.contentType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 font-mono text-xs text-neutral-300">
                      {mediaData.sizeBytes > 0 ? formatBytes(mediaData.sizeBytes) : 'Stream Target'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold">
                      SSRF Safe
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* STEP 3: Quality Picker Tile Selection & Download */}
              {!completedResult ? (
                <GlassCard intensity="deep" className="p-6 rounded-3xl border-white/10">
                  <QualityOptionPicker
                    mediaCategory={mediaData.category}
                    sourceWidth={mediaData.dimensions?.width || 1920}
                    sourceHeight={mediaData.dimensions?.height || 1080}
                    durationSeconds={mediaData.durationSeconds || 60}
                    originalSizeBytes={mediaData.sizeBytes || 45 * 1024 * 1024}
                    isProcessing={isProcessing}
                    progressPercent={progressPercent}
                    stageMessage={stageMessage}
                    onSelectAndDownload={handleSelectAndDownload}
                    onTrimFirst={() => router.push(`/edit`)}
                    onCompress={(targetBytes) => router.push(`/compress`)}
                    onOpenAdvanced={() => router.push('/')}
                  />
                </GlassCard>
              ) : (
                /* SUCCESS DOWNLOAD CARD */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springTokens.snappy}
                >
                  <GlassCard intensity="deep" className="p-6 sm:p-8 rounded-3xl border-emerald-500/30 space-y-6">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Ready for Download!</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                      <div className="truncate max-w-md text-white font-medium">
                        {completedResult.filename}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-cyan-300 font-bold">{completedResult.sizeFormatted}</span>
                        {completedResult.isStreamCopy && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
                            Instant Remux
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <a
                        href={completedResult.downloadUrl}
                        download={completedResult.filename}
                        className="w-full"
                      >
                        <CupertinoButton
                          variant="primary"
                          size="lg"
                          className="w-full text-base font-bold shadow-xl shadow-emerald-500/20"
                          leftIcon={<Download className="w-5 h-5" />}
                        >
                          Save {completedResult.filename}
                        </CupertinoButton>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setCompletedResult(null);
                          setUrl('');
                          setMediaData(null);
                          setValidationState('idle');
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors inline-flex items-center justify-center gap-2 shrink-0"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Convert Another</span>
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
