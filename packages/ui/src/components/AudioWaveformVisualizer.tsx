'use client';

import React, { useRef, useEffect } from 'react';

export type VisualizerStyle = 'bars' | 'wave' | 'circle' | 'pulse';

export interface AudioWaveformVisualizerProps {
  isPlaying?: boolean;
  style?: VisualizerStyle;
  color?: string;
  barCount?: number;
  className?: string;
}

export function AudioWaveformVisualizer({
  isPlaying = true,
  style = 'bars',
  color = '#00F2FE',
  barCount = 48,
  className = '',
}: AudioWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += isPlaying ? 0.08 : 0.01;

      if (style === 'bars') {
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const distance = Math.abs(i - barCount / 2) / (barCount / 2);
          const baseHeight = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
          const barH = (baseHeight * (1 - distance * 0.5) * (height * 0.7) + 6) * (isPlaying ? 1 : 0.2);

          const gradient = ctx.createLinearGradient(0, centerY - barH / 2, 0, centerY + barH / 2);
          gradient.addColorStop(0, '#0A84FF');
          gradient.addColorStop(1, '#00F2FE');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(i * barWidth + 1, centerY - barH / 2, barWidth - 2, barH, 4);
          ctx.fill();
        }
      } else if (style === 'wave') {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        for (let x = 0; x < width; x += 3) {
          const amp = isPlaying ? Math.sin(phase + x * 0.04) * 25 + Math.cos(phase * 1.5 + x * 0.02) * 15 : 2;
          const y = centerY + amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (style === 'circle') {
        const centerX = width / 2;
        const radius = Math.min(width, height) * 0.28;
        const points = 36;

        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const amp = (Math.sin(phase * 2 + i * 0.6) * 16 + 6) * (isPlaying ? 1 : 0.2);
          const r = radius + amp;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#00F2FE';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (style === 'pulse') {
        const centerX = width / 2;
        const pulseSize = (Math.sin(phase * 3) * 20 + 40) * (isPlaying ? 1 : 0.3);
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10, 132, 255, 0.25)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00F2FE';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, style, color, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={180}
      className={`w-full h-full object-contain ${className}`}
    />
  );
}
