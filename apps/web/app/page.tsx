'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropZonePrimitive,
  GlassCard,
  CupertinoButton,
  FilePreviewCard,
  FormatSelector,
  QualityPresetSelector,
  AdvancedSettingsAccordion,
  EngineSelector,
  ConversionProgressCard,
  ConversionResultCard,
  RetryErrorCard,
  QueueStatusCapsule,
  AdvancedSettingsState,
  fadeUpVariant,
  staggerContainerVariant,
  TrustStrip,
  HowItWorksSection,
  SupportedFormatsGrid,
  FaqSection,
} from '@universal/ui';
import {
  FormatDefinition,
  QualityPreset,
  MediaProbeResult,
  getFormatById,
} from '@universal/format-registry';
import { ConversionRequest, EngineMode } from '@universal/job-contracts';
import {
  probeMediaFile,
  evaluateHybridRouting,
  WasmBrowserEngine,
  CloudMediaEngine,
} from '@universal/conversion-core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Music,
  Minimize2,
  Scissors,
  Share2,
  Layers,
  Shield,
  Zap,
  WifiOff,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Workflow State: 'idle' | 'configuring' | 'converting' | 'completed' | 'error'
  const [stage, setStage] = useState<'idle' | 'configuring' | 'converting' | 'completed' | 'error'>('idle');

  // Active File & Probe Metadata
  const [file, setFile] = useState<File | null>(null);
  const [probeResult, setProbeResult] = useState<MediaProbeResult | null>(null);

  // Conversion Settings State
  const [targetFormat, setTargetFormat] = useState<FormatDefinition>(getFormatById('mp4')!);
  const [preset, setPreset] = useState<QualityPreset>('balanced');
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsState>({});
  const [enginePreference, setEnginePreference] = useState<EngineMode>('auto');

  // In-flight conversion state
  const [progressPercent, setProgressPercent] = useState(0);
  const [conversionStage, setConversionStage] = useState('Initializing...');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeEngine, setActiveEngine] = useState<'device' | 'cloud'>('device');
  const [resultData, setResultData] = useState<{
    downloadUrl: string;
    outputFilename: string;
    outputSizeBytes: number;
    engineUsed: 'device' | 'cloud';
  } | null>(null);

  // Handle file selection from dropzone
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setStage('configuring');

    const probed = await probeMediaFile(selectedFile);
    setProbeResult(probed);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'mp4' || ext === 'mov') {
      setTargetFormat(getFormatById('webm') || getFormatById('mp3')!);
    } else if (ext === 'wav') {
      setTargetFormat(getFormatById('mp3')!);
    } else {
      setTargetFormat(getFormatById('mp4')!);
    }
  };

  // Evaluate Hybrid Engine Decision
  const routing = evaluateHybridRouting(
    file?.size || 0,
    {
      id: 'preview',
      inputFilename: file?.name || '',
      inputSizeBytes: file?.size || 1,
      inputMimeType: file?.type || '',
      targetFormat: targetFormat.id,
      preset,
      enginePreference,
    } as ConversionRequest
  );

  // Execute Conversion
  const handleStartConversion = async (overrideEngine?: 'device' | 'cloud') => {
    if (!file) return;

    const chosenEngineType = overrideEngine || routing.engine;
    setActiveEngine(chosenEngineType);
    setStage('converting');
    setProgressPercent(8);
    setConversionStage(
      chosenEngineType === 'cloud'
        ? 'Connecting to Cloud Turbo cluster...'
        : 'Preparing on-device WebAssembly engine...'
    );

    const engine = chosenEngineType === 'cloud' ? new CloudMediaEngine() : new WasmBrowserEngine();

    const request: ConversionRequest = {
      id: crypto.randomUUID(),
      inputFilename: file.name,
      inputSizeBytes: file.size,
      inputMimeType: file.type,
      targetFormat: targetFormat.id,
      preset,
      enginePreference: chosenEngineType,
      video: {
        crf: advancedSettings.crf,
        fps: advancedSettings.fps,
      },
      audio: {
        bitrateKbps: advancedSettings.audioBitrateKbps,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      let lastProgressTick = 0;
      const throttledProgress = (progress: { progressPercent: number; stage: string }) => {
        const now = Date.now();
        if (progress.progressPercent === 100 || progress.progressPercent <= 10 || now - lastProgressTick >= 80) {
          lastProgressTick = now;
          setProgressPercent(progress.progressPercent);
          setConversionStage(progress.stage);
        }
      };

      const result = await engine.convert(file, request, throttledProgress);

      const url = URL.createObjectURL(result.outputBlob);
      setResultData({
        downloadUrl: url,
        outputFilename: result.outputFilename,
        outputSizeBytes: result.outputSizeBytes,
        engineUsed: result.engineUsed,
      });

      setStage('completed');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setErrorMessage(
        err?.message ||
          'Your browser encountered memory limits while processing this video client-side.'
      );
      setStage('error');
    }
  };

  const handleReset = () => {
    if (resultData?.downloadUrl) {
      URL.revokeObjectURL(resultData.downloadUrl);
    }
    setFile(null);
    setProbeResult(null);
    setResultData(null);
    setProgressPercent(0);
    setStage('idle');
  };

  const tools = [
    {
      title: 'Video Studio',
      desc: 'Transcode to MP4, WebM, HEVC, and ProRes with custom resolution.',
      icon: Film,
      color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400',
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      title: 'Audio Extractor',
      desc: 'Extract MP3, WAV, AAC, and FLAC soundtracks at up to 320kbps.',
      icon: Music,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400',
      action: () => {
        setTargetFormat(getFormatById('mp3')!);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      title: 'Smart Compressor',
      desc: 'Reduce file sizes by up to 80% while retaining crystal clarity.',
      icon: Minimize2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
      action: () => router.push('/compress'),
    },
    {
      title: 'Trim & Merge',
      desc: 'Sub-frame precision cutting, video splicing, and audio alignment.',
      icon: Scissors,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
      action: () => router.push('/edit'),
    },
    {
      title: 'Audio to Video',
      desc: 'Generate animated waveforms and visuals for podcasts and music.',
      icon: Share2,
      color: 'from-pink-500/20 to-rose-500/10 text-pink-400',
      action: () => router.push('/audio-to-video'),
    },
    {
      title: 'GIF & Batch Queue',
      desc: 'Bulk conversion and multi-clip high framerate animated GIF export.',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-300',
      action: () => router.push('/batch'),
    },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        <AnimatePresence mode="wait">
          {/* STAGE 1: IDLE HERO */}
          {stage === 'idle' && (
            <motion.section
              key="stage-idle"
              variants={staggerContainerVariant}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <motion.div variants={fadeUpVariant} className="inline-block">
                <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-cyan-400">
                  ⚡ Next-Generation Hybrid Media Engine
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUpVariant}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight"
              >
                Convert, Compress & Edit at the Speed of Light
              </motion.h1>

              <motion.p
                variants={fadeUpVariant}
                className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto"
              >
                Instant on-device processing powered by WebAssembly, with automatic high-speed cloud cluster failover for heavy 4K encodes.
              </motion.p>

              {/* Primary Drop Zone */}
              <motion.div variants={fadeUpVariant} className="pt-4 max-w-2xl mx-auto">
                <DropZonePrimitive onFileSelect={handleFileSelect} />
              </motion.div>
            </motion.section>
          )}

          {/* STAGE 2: CONVERT WORKSPACE CONFIGURATION */}
          {stage === 'configuring' && file && (
            <motion.section
              key="stage-configuring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <FilePreviewCard
                file={file}
                probeResult={probeResult}
                onRemove={handleReset}
              />

              <GlassCard className="p-6">
                <FormatSelector
                  selectedFormatId={targetFormat.id}
                  onSelectFormat={setTargetFormat}
                />
              </GlassCard>

              <GlassCard className="p-6">
                <QualityPresetSelector
                  selectedPreset={preset}
                  onSelectPreset={setPreset}
                  inputSizeBytes={file.size}
                />
              </GlassCard>

              <AdvancedSettingsAccordion
                settings={advancedSettings}
                onChange={setAdvancedSettings}
              />

              <EngineSelector
                engineMode={enginePreference}
                resolvedEngine={routing.engine}
                reason={routing.reason}
                onChange={setEnginePreference}
              />

              <div className="pt-2 flex justify-end">
                <CupertinoButton
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => handleStartConversion()}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Convert to {targetFormat.extension.toUpperCase()} Now
                </CupertinoButton>
              </div>
            </motion.section>
          )}

          {/* STAGE 3: CONVERTING IN-FLIGHT */}
          {stage === 'converting' && file && (
            <motion.section
              key="stage-converting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-10 max-w-xl mx-auto space-y-4"
            >
              {activeEngine === 'cloud' && (
                <div className="flex justify-center">
                  <QueueStatusCapsule />
                </div>
              )}

              <ConversionProgressCard
                filename={file.name}
                progressPercent={progressPercent}
                stage={conversionStage}
                engineUsed={activeEngine}
                onCancel={handleReset}
              />
            </motion.section>
          )}

          {/* STAGE 4: RESULT SUCCESS */}
          {stage === 'completed' && file && resultData && (
            <motion.section
              key="stage-completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 max-w-xl mx-auto"
            >
              <ConversionResultCard
                outputFilename={resultData.outputFilename}
                outputSizeBytes={resultData.outputSizeBytes}
                originalSizeBytes={file.size}
                downloadUrl={resultData.downloadUrl}
                engineUsed={resultData.engineUsed}
                onReset={handleReset}
              />
            </motion.section>
          )}

          {/* STAGE 5: RESILIENT ERROR RECOVERY */}
          {stage === 'error' && file && (
            <motion.section
              key="stage-error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 max-w-xl mx-auto"
            >
              <RetryErrorCard
                errorMessage={errorMessage}
                suggestCloud={true}
                onRetryCloud={() => handleStartConversion('cloud')}
                onModifySettings={() => setStage('configuring')}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* When Idle: Full Creative Suite, Workflow Blueprint, Format Matrix, and FAQ */}
        {stage === 'idle' && (
          <>
            <TrustStrip />

            {/* Tool Cards Grid */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Creative Tool Suite</h2>
                  <p className="text-xs text-neutral-400 mt-1">Specialized sub-studios for compression, trimming, audio video generation</p>
                </div>
                <span className="text-xs font-mono text-neutral-400">6 Modular Engines</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <GlassCard
                      key={tool.title}
                      intensity="medium"
                      whileHover={{ y: -4 }}
                      onClick={tool.action}
                      className="p-6 cursor-pointer group"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${tool.color} border border-white/10 mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-cyan-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">{tool.desc}</p>
                    </GlassCard>
                  );
                })}
              </div>
            </section>

            {/* Interactive 3-Step Workflow */}
            <HowItWorksSection />

            {/* Interactive Format Matrix */}
            <SupportedFormatsGrid
              onSelectFormat={(fmtId) => {
                const target = getFormatById(fmtId);
                if (target) setTargetFormat(target);
              }}
            />

            {/* Frequently Asked Questions */}
            <FaqSection />
          </>
        )}
      </main>
    </div>
  );
}
