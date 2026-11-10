'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DropZonePrimitive,
  MediaInfoInspector,
  CupertinoButton,
} from '@universal/ui';
import { ArrowLeft, Info, RefreshCw } from 'lucide-react';
import { probeMediaFile } from '@universal/conversion-core';
import { MediaProbeResult } from '@universal/format-registry';

export default function MediaInfoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [probeData, setProbeData] = useState<MediaProbeResult | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const result = await probeMediaFile(selectedFile);
    setProbeData(result);
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
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 font-semibold">
            Media Diagnostics & Inspector
          </span>
        </div>

        {!file || !probeData ? (
          <div className="py-12 space-y-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Inspect Codecs, Streams & Container Tags
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
              Drop any audio or video file to extract deep structural diagnostics, stream layouts, bitrates, and color specifications.
            </p>
            <div className="max-w-2xl mx-auto pt-4">
              <DropZonePrimitive onFileSelect={handleFileSelect} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <MediaInfoInspector probeData={probeData} />

            <div className="flex justify-between items-center pt-2">
              <CupertinoButton
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setProbeData(null);
                }}
              >
                Inspect Another File
              </CupertinoButton>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
