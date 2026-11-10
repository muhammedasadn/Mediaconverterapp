'use client';

import React from 'react';

export interface MetricBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'neutral' | 'accent' | 'success';
}

export function MetricBadge({ label, value, unit, variant = 'neutral' }: MetricBadgeProps) {
  const variantStyles = {
    neutral: 'bg-white/[0.05] border-white/10 text-neutral-300',
    accent: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs select-none backdrop-blur-md ${variantStyles[variant]}`}
    >
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-semibold">
        {label}:
      </span>
      <span className="font-semibold text-white">
        {value}
        {unit && <span className="ml-0.5 text-[10px] text-neutral-400">{unit}</span>}
      </span>
    </div>
  );
}
