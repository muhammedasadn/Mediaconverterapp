'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { YouTubeHelperStudio } from '@universal/ui';
import { ArrowLeft } from 'lucide-react';

export default function YouTubeHelperPage() {
  const router = useRouter();

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
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 font-semibold">
            YouTube Creator Workflows
          </span>
        </div>

        {/* Studio Card */}
        <YouTubeHelperStudio
          onFileDropToConvert={() => router.push('/')}
          onNavigateToImport={(url) => router.push(`/import?url=${encodeURIComponent(url)}`)}
        />
      </main>
    </div>
  );
}
