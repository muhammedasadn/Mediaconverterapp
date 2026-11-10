'use client';

import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { MobileTabBar } from '../components/MobileTabBar';
import { CommandPalette } from '../components/CommandPalette';
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
  AdvancedSettingsState,
  fadeUpVariant,
  staggerContainerVariant,
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Workflow State: 'idle' | 'configuring' | 'converting' | 'completed'
  const [stage, setStage] = useState<'idle' | 'configuring' | 'converting' | 'completed'>('idle');

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

    // Run client probe
    const probed = await probeMediaFile(selectedFile);
    setProbeResult(probed);

    // Auto-select smart default target format
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
  const handleStartConversion = async () => {
    if (!file) return;

    setStage('converting');
    setProgressPercent(10);
    setConversionStage('Preparing encoder...');

    const engine = new WasmBrowserEngine();

    const request: ConversionRequest = {
      id: crypto.randomUUID(),
      inputFilename: file.name,
      inputSizeBytes: file.size,
      inputMimeType: file.type,
      targetFormat: targetFormat.id,
      preset,
      enginePreference,
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
      const result = await engine.convert(file, request, (progress) => {
        setProgressPercent(progress.progressPercent);
        setConversionStage(progress.stage);
      });

      const url = URL.createObjectURL(result.outputBlob);
      setResultData({
        downloadUrl: url,
        outputFilename: result.outputFilename,
        outputSizeBytes: result.outputSizeBytes,
        engineUsed: result.engineUsed,
      });

      setStage('completed');
    } catch (err) {
      console.error('Conversion failed:', err);
      setStage('configuring');
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
    },
    {
      title: 'Audio Extractor',
      desc: 'Extract MP3, WAV, AAC, and FLAC soundtracks at up to 320kbps.',
      icon: Music,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400',
    },
    {
      title: 'Smart Compressor',
      desc: 'Reduce file sizes by up to 80% while retaining crystal clarity.',
      icon: Minimize2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    },
    {
      title: 'Trim & Merge',
      desc: 'Sub-frame precision cutting, video splicing, and audio alignment.',
      icon: Scissors,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
    },
    {
      title: 'Audio to Video',
      desc: 'Generate animated waveforms and visuals for podcasts and music.',
      icon: Share2,
      color: 'from-pink-500/20 to-rose-500/10 text-pink-400',
    },
    {
      title: 'GIF Maker',
      desc: 'Convert high-framerate video clips into smooth looping animated GIFs.',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-300',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 space-y-12">
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
                  ⚡ Next-Generation Media Engine
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
                Instant on-device processing powered by WebAssembly. Your files never leave your browser unless you choose cloud turbo.
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
              {/* File Card */}
              <FilePreviewCard
                file={file}
                probeResult={probeResult}
                onRemove={handleReset}
              />

              {/* Format Picker */}
              <GlassCard className="p-6">
                <FormatSelector
                  selectedFormatId={targetFormat.id}
                  onSelectFormat={setTargetFormat}
                />
              </GlassCard>

              {/* Preset Selector */}
              <GlassCard className="p-6">
                <QualityPresetSelector
                  selectedPreset={preset}
                  onSelectPreset={setPreset}
                  inputSizeBytes={file.size}
                />
              </GlassCard>

              {/* Advanced Accordion */}
              <AdvancedSettingsAccordion
                settings={advancedSettings}
                onChange={setAdvancedSettings}
              />

              {/* Hybrid Engine Routing */}
              <EngineSelector
                engineMode={enginePreference}
                resolvedEngine={routing.engine}
                reason={routing.reason}
                onChange={setEnginePreference}
              />

              {/* Start Conversion Button */}
              <div className="pt-2 flex justify-end">
                <CupertinoButton
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleStartConversion}
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
              className="py-10 max-w-xl mx-auto"
            >
              <ConversionProgressCard
                filename={file.name}
                progressPercent={progressPercent}
                stage={conversionStage}
                engineUsed={routing.engine}
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
        </AnimatePresence>

        {/* Trust Badges Strip (only shown on idle) */}
        {stage === 'idle' && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <GlassCard intensity="subtle" className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">100% Private</h3>
                  <p className="text-xs text-neutral-400">Files processed on-device. Zero data logging.</p>
                </div>
              </GlassCard>

              <GlassCard intensity="subtle" className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Instant Starts</h3>
                  <p className="text-xs text-neutral-400">No queues or uploads for local conversions.</p>
                </div>
              </GlassCard>

              <GlassCard intensity="subtle" className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <WifiOff className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Offline Ready</h3>
                  <p className="text-xs text-neutral-400">Install as PWA and convert without internet.</p>
                </div>
              </GlassCard>
            </section>

            {/* Tool Cards Grid */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">Creative Tool Suite</h2>
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
          </>
        )}
      </main>

      <MobileTabBar />
    </div>
  );
}
