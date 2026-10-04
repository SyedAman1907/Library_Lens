import React, { useState } from 'react';
import { ResearchRecord, ReportVersion } from '../types';
import {
  X,
  History,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Calendar
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  research: ResearchRecord;
  onSelectVersionPreview?: (version: ReportVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  research,
  onSelectVersionPreview,
}) => {
  const versions = research.versions || [];
  const currentVersionNumber = research.currentVersionNumber || (versions.length + 1);

  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(currentVersionNumber);

  if (!isOpen) return null;

  const currentSummary = research.report?.summary || '';
  const selectedVersion = versions.find((v) => v.versionNumber === selectedVersionNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="workspace-card w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-white/[0.1] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-500" />
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                Report Version Audit & Diffs
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Inspect changes between live research updates and historical runs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Version Pills */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
              Available Iterations ({versions.length + 1})
            </span>
            <div className="flex flex-wrap gap-2">
              {/* Current Version */}
              <button
                onClick={() => setSelectedVersionNum(currentVersionNumber)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedVersionNum === currentVersionNumber
                    ? 'bg-brand-500 text-white font-bold shadow-glow'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>v{currentVersionNumber} (Current Live)</span>
              </button>

              {/* Historical Versions */}
              {versions.map((ver) => (
                <button
                  key={ver.versionNumber}
                  onClick={() => setSelectedVersionNum(ver.versionNumber)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedVersionNum === ver.versionNumber
                      ? 'bg-brand-500 text-white font-bold shadow-glow'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>v{ver.versionNumber}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details for Selected Version */}
          {selectedVersionNum === currentVersionNumber ? (
            /* Current Live Run Details */
            <div className="space-y-4">
              <div className="p-4 rounded-xl workspace-card-subtle space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    Version {currentVersionNumber} • Active Report
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Updated {new Date(research.updatedAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-xs">
                  {currentSummary}
                </p>
              </div>

              {/* Diff summary if refreshed */}
              {versions.length > 0 && versions[0].diff && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-3">
                  <span className="font-mono text-[10px] uppercase font-bold text-brand-500 block">
                    Incremental Diff vs Previous Run (v{versions[0].versionNumber})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>+{versions[0].diff.addedSourcesCount || 0} Sources</span>
                    </div>

                    <div className="p-2.5 rounded bg-blue-500/10 text-blue-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+{versions[0].diff.newReleasesCount || 0} Releases</span>
                    </div>

                    <div className="p-2.5 rounded bg-purple-500/10 text-purple-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{versions[0].diff.updatedClaimsCount || 0} Revalidated</span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-200 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Live Cache</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedVersion ? (
            /* Historical Snapshot Details */
            <div className="space-y-4">
              <div className="p-4 rounded-xl workspace-card-subtle space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    Historical Snapshot v{selectedVersion.versionNumber}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Created {new Date(selectedVersion.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-xs">
                  {selectedVersion.summary}
                </p>
              </div>

              {selectedVersion.diff && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2 text-xs font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Recorded Delta At This Refresh
                  </span>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-emerald-500">+{selectedVersion.diff.addedSourcesCount} added sources</span>
                    <span className="text-blue-500">+{selectedVersion.diff.newReleasesCount} new releases</span>
                    <span className="text-accent-500">{selectedVersion.diff.updatedClaimsCount} claims refreshed</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-[10px] font-mono text-slate-400">
            Immutable research version records
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
