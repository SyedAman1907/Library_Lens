import React from 'react';
import { BreakingChangeItem, Source } from '../types';
import { CitationBadge } from './CitationBadge';
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';

interface BreakingChangeRadarProps {
  breakingChanges: BreakingChangeItem[];
  sources: Source[];
  onSelectSource: (source: Source) => void;
}

export const BreakingChangeRadar: React.FC<BreakingChangeRadarProps> = ({
  breakingChanges,
  sources,
  onSelectSource,
}) => {
  const hasChanges = breakingChanges && breakingChanges.length > 0;

  return (
    <div className="workspace-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-500 font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Empirical Incompatibility Tracker</span>
          </div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Breaking-Change Radar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified breaking alterations and deprecations extracted from official release manuals and changelogs.
          </p>
        </div>

        {hasChanges && (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold self-start sm:self-auto">
            {breakingChanges.length} Documented Change(s)
          </span>
        )}
      </div>

      {/* Content */}
      {hasChanges ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakingChanges.map((item, idx) => {
            const isHigh = item.impact === 'High';
            const isMedium = item.impact === 'Medium' || !item.impact;
            const requiresMigration = item.migrationRequired ?? true;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl workspace-card-subtle border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-colors"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                        {item.library} {item.affectedVersion ? `v${item.affectedVersion}` : ''}
                      </span>
                      {item.sourceId && (
                        <CitationBadge
                          sourceId={item.sourceId}
                          sources={sources}
                          onSelectSource={onSelectSource}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          isHigh
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : isMedium
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {item.impact || 'MEDIUM'} IMPACT
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          requiresMigration
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}
                      >
                        {requiresMigration ? 'Migration Required' : 'Optional'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Migration Guidance Box */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.04] text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white mb-1">
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    <span>Official Guidance</span>
                  </div>
                  <p className="leading-relaxed">
                    {item.migrationGuidance}
                  </p>
                  {item.officialSource && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-white/[0.03] text-[10px] font-mono text-slate-400">
                      Anchor: {item.officialSource}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-xl workspace-card-subtle text-center text-xs text-slate-400 font-mono">
          No verified breaking-change information was found in the researched sources.
        </div>
      )}
    </div>
  );
};
