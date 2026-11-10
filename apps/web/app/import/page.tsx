'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LinkImportCard, GlassCard, CupertinoButton } from '@universal/ui';
import { ArrowLeft, ArrowRight, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const [importedFile, setImportedFile] = useState<{
    name: string;
    url: string;
    sizeBytes?: number;
  } | null>(null);

  const handleImportSuccess = (file: { name: string; url: string; sizeBytes?: number }) => {
    setImportedFile(file);
  };

  return (
    <div className="flex flex-col">
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
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 font-semibold">
            Direct Link Import Studio
          </span>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Import Public & Open-Source Media
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Paste direct links from Wikimedia, Internet Archive, or your own public storage without manual download steps.
          </p>
        </div>

        {/* Import Input Card */}
        <LinkImportCard onImportSuccess={handleImportSuccess} />

        {/* Success Action Modal */}
        {importedFile && (
          <GlassCard intensity="deep" className="p-6 rounded-3xl border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Media Link Validated & Ready</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-300 truncate">
              {importedFile.name}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <CupertinoButton
                variant="primary"
                onClick={() => {
                  router.push('/');
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Convert & Edit
              </CupertinoButton>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
