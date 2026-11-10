'use client';

import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
  spotlight?: boolean;
  intensity?: 'subtle' | 'medium' | 'deep';
}

export function GlassCard({
  children,
  spotlight = true,
  intensity = 'medium',
  className = '',
  ...props
}: GlassCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const intensityClasses = {
    subtle: 'bg-white/[0.02] border-white/5',
    medium: 'bg-white/[0.04] border-white/10',
    deep: 'bg-white/[0.07] border-white/15',
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={`relative overflow-hidden rounded-3xl border ${intensityClasses[intensity]} backdrop-blur-2xl transition-shadow duration-300 ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.12), 0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      }}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Reflection */}
      {spotlight && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: isFocused ? 1 : 0,
            background: `radial-gradient(500px circle at ${coords.x}px ${coords.y}px, rgba(10, 132, 255, 0.12), transparent 45%)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
