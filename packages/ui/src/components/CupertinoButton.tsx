'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface CupertinoButtonProps extends HTMLMotionProps<'button'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function CupertinoButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  disabled,
  ...props
}: CupertinoButtonProps) {
  const { triggerHaptic } = useHapticFeedback();

  const baseStyles = 'relative inline-flex items-center justify-center font-medium select-none transition-colors overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50';

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-xs rounded-xl gap-1.5',
    md: 'h-11 px-5 text-sm rounded-2xl gap-2',
    lg: 'h-14 px-7 text-base rounded-2xl gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:brightness-95 border border-white/20',
    secondary:
      'bg-white/10 text-white hover:bg-white/15 active:bg-white/20 border border-white/10 backdrop-blur-xl',
    glass:
      'cupertino-glass text-white hover:border-white/30 active:bg-white/10',
    ghost:
      'bg-transparent text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      transition={springTokens.snappy}
      onClick={(e) => {
        triggerHaptic('light');
        onClick?.(e);
      }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {/* Specular hairline top glow */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
