import React from 'react';
import { Source } from '../types';
import { X, ExternalLink, ShieldCheck, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SourceDrawerProps {
  source: Source | null;
  onClose: () => void;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({ source, onClose }) => {
  if (!source) return null;

  const isOfficial = source.tier === 1;

  const getTierLabel = () => {
    switch (source.tier) {
      case 1: return { label: 'Tier 1 • Official Documentation & Releases', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 2: return { label: 'Tier 2 • Official Package Registry (npm/PyPI/crates)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 3: return { label: 'Tier 3 • Official Announcements', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 4: return { label: 'Tier 4 • Reputable Technical Publications', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default: return { label: 'Tier 5 • Community Sources & Web', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
    }
  };

  const tierInfo = getTierLabel();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg bg-slate-900 dark:bg-slate-900 border-l border-slate-800 dark:border-slate-800 shadow-2xl p-6 flex flex-col h-full z-10 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800 dark:border-slate-800">
            <div className="flex flex-col gap-1.5 pr-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${tierInfo.color}`}>
                  {tierInfo.label}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white dark:text-white leading-tight">
                {source.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="py-5 flex-1 space-y-5">
            {/* Publisher & Confidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/50 dark:bg-slate-950/50 border border-slate-800/80 dark:border-slate-800/80">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Publisher / Origin</div>
                <div className="text-sm font-semibold text-slate-200 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                  <span>{source.publisher}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 dark:bg-slate-950/50 border border-slate-800/80 dark:border-slate-800/80">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Evidence Confidence</div>
                <div className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{(source.confidence * 100).toFixed(0)}% Verified</span>
                </div>
              </div>
            </div>

            {/* Evidence Snippet */}
            <div>
              <div className="text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                Extracted Evidence Snippet
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 dark:bg-slate-950/70 border border-slate-800/90 dark:border-slate-800/90 text-sm text-slate-300 dark:text-slate-300 leading-relaxed font-mono">
                {source.snippet || 'Evidence verified from canonical resource metadata.'}
              </div>
            </div>

            {/* Claim (if available) */}
            {source.claim && (
              <div>
                <div className="text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                  Associated Claim
                </div>
                <div className="p-3.5 rounded-xl bg-brand-950/30 border border-brand-800/40 text-xs text-brand-200 font-medium">
                  {source.claim}
                </div>
              </div>
            )}

            {/* Freshness / Retrieval Timestamps */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 dark:bg-slate-950/40 border border-slate-800/60 dark:border-slate-800/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Published Date</span>
                </span>
                <span className="font-mono text-slate-300 dark:text-slate-300">
                  {source.publishedAt ? new Date(source.publishedAt).toLocaleDateString() : 'Active Documentation'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  <span>Retrieved Live</span>
                </span>
                <span className="font-mono text-brand-300">
                  {new Date(source.retrievedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 dark:border-slate-800 flex items-center gap-3">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 transition-opacity"
            >
              <span>Open Verified Source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
