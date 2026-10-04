import React, { useState } from 'react';
import { Source } from '../types';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface CitationBadgeProps {
  sourceId: string;
  sources: Source[];
  onSelectSource?: (source: Source) => void;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  sourceId,
  sources,
  onSelectSource,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Find corresponding source
  const source = sources.find((s) => s.id === sourceId);
  const index = sources.findIndex((s) => s.id === sourceId) + 1;
  const citationNumber = index > 0 ? index : sourceId.replace('src_', '');

  if (!source) {
    return (
      <span
        className="inline-flex items-center text-[10px] font-mono font-semibold px-1 py-0.2 mx-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50"
        title="Unverified source citation"
      >
        [{citationNumber}]
      </span>
    );
  }

  const isOfficial = source.tier === 1;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSelectSource) {
      onSelectSource(source);
    } else {
      // Smooth scroll to source card if present in DOM
      const el = document.getElementById(`source-card-${source.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-brand-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-brand-400'), 2500);
      } else {
        window.open(source.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <span className="relative inline-block align-baseline mx-0.5 group">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
          isOfficial
            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 shadow-sm'
            : 'bg-brand-500/15 text-brand-300 hover:bg-brand-500/25 border border-brand-500/30'
        }`}
        aria-label={`Source citation ${citationNumber}: ${source.title}`}
      >
        {isOfficial && <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 inline" />}
        <span>[{citationNumber}]</span>
      </button>

      {/* Hover Preview Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 dark:text-slate-100 border border-slate-700/80 dark:border-slate-700/80 shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                isOfficial
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
              }`}
            >
              {isOfficial ? 'OFFICIAL SOURCE' : source.sourceType.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {source.publisher}
            </span>
          </div>
          <p className="text-xs font-medium line-clamp-2 leading-snug text-slate-200 dark:text-slate-200">
            {source.title}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-brand-400">
            <ExternalLink className="w-2.5 h-2.5" />
            <span className="truncate">{source.url.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>
      )}
    </span>
  );
};
