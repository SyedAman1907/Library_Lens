import React from 'react';
import { Search, ShieldCheck, Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#E5E7EB] dark:border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950/60 text-[#52525B] dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6D4AFF] text-white">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-[#111114] dark:text-slate-200 text-sm">
              LibraryLens AI
            </div>
            <div className="text-[11px] text-[#71717A] dark:text-slate-400">
              Evidence-Backed Software Library Research Assistant
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Citation Validated</span>
          </span>
          <span className="text-[#D9DCE3] dark:text-slate-700">•</span>
          <span className="text-[#71717A] dark:text-slate-400">SerpApi Search Tools</span>
          <span className="text-[#D9DCE3] dark:text-slate-700">•</span>
          <span className="text-[#71717A] dark:text-slate-400">Model Context Protocol</span>
          <span className="text-[#D9DCE3] dark:text-slate-700">•</span>
          <span className="text-[#71717A] dark:text-slate-400">Gemini Reasoning Layer</span>
        </div>

        <div className="text-center md:text-right text-[11px] text-[#71717A] dark:text-slate-400 font-mono">
          Core Rule: <strong className="text-[#6D4AFF] dark:text-brand-300">NO SOURCE = NO FACT</strong>
        </div>
      </div>
    </footer>
  );
};
