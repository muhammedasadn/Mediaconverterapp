'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ShieldAlert, Check, X, ArrowRight, Trash2 } from 'lucide-react';
import { CupertinoButton } from './CupertinoButton';
import { springTokens } from '../motion/tokens';
import { useHapticFeedback } from '../motion/hooks';

export interface AuthAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    email: string;
    cloudJobsUsed: number;
    cloudJobsLimit: number;
  } | null;
  onSendMagicLink: (email: string) => void;
  onDeleteAccount: () => void;
}

export function AuthAccountModal({
  isOpen,
  onClose,
  currentUser,
  onSendMagicLink,
  onDeleteAccount,
}: AuthAccountModalProps) {
  const [email, setEmail] = useState('');
  const [sentLink, setSentLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={springTokens.snappy}
        className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/20 bg-neutral-900/95 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {currentUser ? (
          // Logged In Account View
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white font-bold text-lg shadow-md">
                {currentUser.email.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white truncate max-w-[220px]">
                  {currentUser.email}
                </h3>
                <span className="text-[11px] text-cyan-300 font-mono">Free Cloud Tier</span>
              </div>
            </div>

            {/* Quota Meter */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Monthly Cloud Turbo Encodes:</span>
                <span className="text-white font-semibold">
                  {currentUser.cloudJobsUsed} / {currentUser.cloudJobsLimit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{
                    width: `${(currentUser.cloudJobsUsed / currentUser.cloudJobsLimit) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Delete Account Danger Zone */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <span className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider block">
                Account Ownership
              </span>
              {showDeleteConfirm ? (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-red-300 font-semibold">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                    <span>Permanently delete account and all cloud job data?</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <CupertinoButton size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </CupertinoButton>
                    <CupertinoButton
                      size="sm"
                      variant="primary"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        triggerHaptic('medium');
                        onDeleteAccount();
                        onClose();
                      }}
                    >
                      Confirm Delete
                    </CupertinoButton>
                  </div>
                </div>
              ) : (
                <CupertinoButton
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => setShowDeleteConfirm(true)}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Delete Account & Purge Data
                </CupertinoButton>
              )}
            </div>
          </div>
        ) : (
          // Passwordless Sign-In View
          <div className="space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
              <User className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-1">Sign In / Create Account</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Optional account for cross-device cloud history and 50 free high-speed Cloud Turbo encodes every month.
              </p>
            </div>

            {sentLink ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0" />
                <span>Magic sign-in link sent to {email}. Click the link to log in.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full rounded-2xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <CupertinoButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (email) {
                      triggerHaptic('medium');
                      onSendMagicLink(email);
                      setSentLink(true);
                    }
                  }}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Send Passwordless Magic Link
                </CupertinoButton>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
