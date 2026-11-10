'use client';

import React from 'react';
import { Activity, Cpu, Server, HardDrive, ShieldCheck, RefreshCw } from 'lucide-react';
import { GlassCard, MetricBadge, CupertinoButton } from '@universal/ui';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Active Native Workers', value: '4 Nodes', icon: Server, color: 'text-cyan-400' },
    { label: 'BullMQ Queue Depth', value: '0 Jobs', icon: Activity, color: 'text-emerald-400' },
    { label: 'Average Transcode FPS', value: '142 fps', icon: Cpu, color: 'text-purple-400' },
    { label: 'MinIO Temporary Storage', value: '1.2 GB', icon: HardDrive, color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-cyan-400" />
            Universal Converter Cluster Telemetry
          </h1>
          <p className="text-xs text-neutral-400">
            Real-time node metrics, worker concurrency, and automated TTL storage status.
          </p>
        </div>

        <CupertinoButton variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh Metrics
        </CupertinoButton>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">{s.label}</span>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{s.value}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Cluster Nodes Table */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Dockerized Worker Nodes (Native FFmpeg 7.x)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th className="pb-3">Node ID</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Concurrency</th>
                <th className="pb-3">Hardware Acceleration</th>
                <th className="pb-3">Active Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              <tr>
                <td className="py-3 text-cyan-400 font-bold">worker-us-east-01</td>
                <td className="py-3 text-emerald-400">● Healthy</td>
                <td className="py-3">4 Threads</td>
                <td className="py-3">NVENC / VAAPI</td>
                <td className="py-3">0</td>
              </tr>
              <tr>
                <td className="py-3 text-cyan-400 font-bold">worker-us-east-02</td>
                <td className="py-3 text-emerald-400">● Healthy</td>
                <td className="py-3">4 Threads</td>
                <td className="py-3">CPU Multi-core</td>
                <td className="py-3">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
