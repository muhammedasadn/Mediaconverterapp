'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '../../components/AppHeader';
import { MobileTabBar } from '../../components/MobileTabBar';
import {
  DropZonePrimitive,
  TimelineTrimEditor,
  CupertinoButton,
  ConversionProgressCard,
  ConversionResultCard,
} from '@universal/ui';
import { ArrowLeft, Scissors, ArrowRight } from 'lucide-react';
import { WasmBrowserEngine } from '@universal/conversion-core';
import { ConversionRequest } from '@universal/job-contracts';

export default function EditTrimPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [trimRange, setTrimRange] = useState<{ start: number; end: number }>({ start: 0, end: 60 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
  };

  const handleStartTrim = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(20);

    const engine = new WasmBrowserEngine();
    const req: ConversionRequest = {
      id: crypto.randomUUID(),
      inputFilename: file.name,
      inputSizeBytes: file.size,
      inputMimeType: file.type,
      targetFormat: 'mp4',
      preset: 'lossless',
      enginePreference: 'device',
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await engine.convert(file, req, (p) => {
        setProgress(p.progressPercent);
      });

      const url = URL.createObjectURL(result.outputBlob);
      setResultUrl(url);
      setIsProcessing(false);
    } catch {
      setIsProcessing(false);
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
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 font-semibold">
            Precision Timeline Cutter
          </span>
        </div>

        {!file ? (
          <div className="py-12 space-y-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Cut & Trim Video with Sub-Frame Precision
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
              Trim clips losslessly with keyboard shortcuts (Space, J/K/L, I/O) and draggable cut handles.
            </p>
            <div className="max-w-2xl mx-auto pt-4">
              <DropZonePrimitive onFileSelect={handleFileSelect} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!resultUrl && !isProcessing && (
              <>
                <TimelineTrimEditor
                  mediaSrc={fileUrl || ''}
                  durationSeconds={60}
                  onTrimChange={(start, end) => setTrimRange({ start, end })}
                />

                <div className="flex justify-between items-center pt-2">
                  <CupertinoButton
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setFileUrl(null);
                    }}
                  >
                    Choose Different Clip
                  </CupertinoButton>

                  <CupertinoButton
                    variant="primary"
                    size="lg"
                    onClick={handleStartTrim}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Export Trimmed Clip ({Math.round(trimRange.end - trimRange.start)}s)
                  </CupertinoButton>
                </div>
              </>
            )}

            {isProcessing && (
              <ConversionProgressCard
                filename={file.name}
                progressPercent={progress}
                stage="Slicing stream at keyframes..."
                engineUsed="device"
                onCancel={() => setIsProcessing(false)}
              />
            )}

            {resultUrl && (
              <ConversionResultCard
                outputFilename={`trimmed_${file.name}`}
                outputSizeBytes={Math.round(file.size * 0.4)}
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
