'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DropZonePrimitive,
  TargetSizeCompressor,
  SplitComparisonViewer,
  CupertinoButton,
  ConversionProgressCard,
  ConversionResultCard,
} from '@universal/ui';
import { ArrowLeft, ArrowRight, Minimize2, Sparkles } from 'lucide-react';
import { WasmBrowserEngine, calculateTargetBitrate, shouldSkipCompression } from '@universal/conversion-core';
import { ConversionRequest } from '@universal/job-contracts';

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [targetSize, setTargetSize] = useState<number>(25 * 1024 * 1024);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setTargetSize(Math.round(selectedFile.size * 0.5)); // Default 50% shrink
  };

  const handleStartCompress = async () => {
    if (!file) return;

    // No-growth guard
    const skipCheck = shouldSkipCompression(file.size, targetSize);
    if (skipCheck.skip) {
      setResultUrl(URL.createObjectURL(file));
      return;
    }

    setIsCompressing(true);
    setProgress(15);
    setStage('Calculating optimal bitrate & resolution...');

    const calc = calculateTargetBitrate({
      targetBytes: targetSize,
      durationSeconds: 60,
      audioBitrateKbps: 96,
      sourceWidth: 1920,
      sourceHeight: 1080,
    });

    const engine = new WasmBrowserEngine();
    const req: ConversionRequest = {
      id: crypto.randomUUID(),
      inputFilename: file.name,
      inputSizeBytes: file.size,
      inputMimeType: file.type,
      targetFormat: 'mp4',
      preset: 'small',
      enginePreference: 'device',
      video: {
        codec: 'libx264',
        width: calc.recommendedWidth,
        height: calc.recommendedHeight,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await engine.convert(file, req, (p) => {
        setProgress(p.progressPercent);
        setStage(p.stage);
      });

      const url = URL.createObjectURL(result.outputBlob);
      setResultUrl(url);
      setIsCompressing(false);
    } catch (err) {
      setIsCompressing(false);
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 font-semibold">
            Smart Compressor Studio
          </span>
        </div>

        {!file ? (
          <div className="py-12 space-y-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Reduce File Size Without Losing Clarity
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
              Select any video or audio file. Target exact Discord, WhatsApp, or email attachment limits with live split-screen comparison.
            </p>
            <div className="max-w-2xl mx-auto pt-4">
              <DropZonePrimitive onFileSelect={handleFileSelect} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Split Comparison Viewer */}
            <SplitComparisonViewer
              originalSrc={fileUrl || undefined}
              compressedSrc={resultUrl || undefined}
              isVideo={true}
            />

            {/* Compressor Controls */}
            {!resultUrl && !isCompressing && (
              <>
                <TargetSizeCompressor
                  originalSizeBytes={file.size}
                  targetSizeBytes={targetSize}
                  onChangeTargetSize={setTargetSize}
                />

                <div className="flex justify-between items-center pt-2">
                  <CupertinoButton
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setFileUrl(null);
                    }}
                  >
                    Change File
                  </CupertinoButton>

                  <CupertinoButton
                    variant="primary"
                    size="lg"
                    onClick={handleStartCompress}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Compress Video Now
                  </CupertinoButton>
                </div>
              </>
            )}

            {/* In-Flight Progress */}
            {isCompressing && (
              <ConversionProgressCard
                filename={file.name}
                progressPercent={progress}
                stage={stage}
                engineUsed="device"
                onCancel={() => setIsCompressing(false)}
              />
            )}

            {/* Result Card */}
            {resultUrl && (
              <ConversionResultCard
                outputFilename={`compressed_${file.name}`}
                outputSizeBytes={targetSize}
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

    </div>
  );
}
