import React from 'react';
import { SpellingCandidate } from '../types';
import { HelpCircle, Check, X } from 'lucide-react';

interface SpellingModalProps {
  candidates: SpellingCandidate[];
  onConfirm: (correctedA?: string, correctedB?: string) => void;
  onDismiss: () => void;
}

export const SpellingModal: React.FC<SpellingModalProps> = ({
  candidates,
  onConfirm,
  onDismiss,
}) => {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md glass-card p-6 border border-brand-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2.5 text-brand-400 mb-3 font-display">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          <h3 className="font-bold text-lg text-white">Did You Mean?</h3>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          We noticed potential spelling variations or abbreviations in your query. Would you like to research these verified canonical libraries?
        </p>

        <div className="space-y-2 mb-6">
          {candidates.map((c, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 line-through mr-2 font-mono">{c.input}</span>
                <span className="text-brand-300 font-bold font-mono text-sm">{c.suggested}</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {c.ecosystem}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Keep Original
          </button>

          <button
            onClick={() => onConfirm()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Suggestions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
