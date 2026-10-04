import React, { useState } from 'react';
import { MigrationGuide, Source } from '../types';
import { CitationBadge } from './CitationBadge';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Code,
  Package,
  RotateCcw,
  CheckSquare,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MigrationAssistantProps {
  migration: MigrationGuide;
  sources: Source[];
  onSelectSource: (source: Source) => void;
}

export const MigrationAssistant: React.FC<MigrationAssistantProps> = ({
  migration,
  sources,
  onSelectSource,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'steps' | 'api' | 'deps' | 'checklist'>('steps');

  const {
    fromLibrary,
    toLibrary,
    currentVersion = 'Current Stable',
    targetVersion = 'Target Stable',
    projectType = 'Production Web Architecture',
    overview,
    potentialBreakingChanges = [],
    migrationSteps = [],
    apiDifferences = [],
    dependencyChanges = [],
    testingChecklist = [],
    rollbackConsiderations = [],
    considerations = [],
  } = migration;

  return (
    <div className="workspace-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-500 font-semibold uppercase tracking-wider mb-1">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Interactive Migration Assistant</span>
          </div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Migrating from {fromLibrary} to {toLibrary}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evidence-anchored transition guide, semantic API mappings, dependency alterations, and rollback checklists.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/[0.06] self-start sm:self-auto">
          <span className="font-semibold text-cyan-600 dark:text-cyan-400">{fromLibrary} (v{currentVersion})</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{toLibrary} (v{targetVersion})</span>
        </div>
      </div>

      {/* Migration Overview & Key Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overview Box */}
        <div className="lg:col-span-2 p-4 rounded-xl workspace-card-subtle flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block mb-1.5">
              Migration Overview
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {overview}
            </p>
          </div>

          {considerations && considerations.length > 0 && (
            <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-white/[0.05] flex flex-wrap gap-2 text-xs">
              <span className="text-[10px] font-mono text-slate-400">Anchored Considerations:</span>
              {considerations.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                  {c.area}
                  {c.sourceIds.map((id) => (
                    <CitationBadge key={id} sourceId={id} sources={sources} onSelectSource={onSelectSource} />
                  ))}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Potential Breaking Changes Box */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold font-mono text-amber-500 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Potential Incompatibilities</span>
            </div>
            {potentialBreakingChanges.length > 0 ? (
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                {potentialBreakingChanges.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-[11px]">
                No critical runtime incompatibilities documented between current versions.
              </p>
            )}
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400">
            Target project: {projectType}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] text-xs font-mono pb-2">
        {[
          { id: 'steps', label: `Step-by-Step Guide (${migrationSteps.length})`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          { id: 'api', label: `API Differences (${apiDifferences.length})`, icon: <Code className="w-3.5 h-3.5" /> },
          { id: 'deps', label: `Dependency Changes (${dependencyChanges.length})`, icon: <Package className="w-3.5 h-3.5" /> },
          { id: 'checklist', label: 'Testing & Rollback', icon: <CheckSquare className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-subtle'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Step-by-Step Guide */}
      {activeSubTab === 'steps' && (
        <div className="space-y-3">
          {migrationSteps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl workspace-card-subtle flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold shrink-0">
                {step.step || idx + 1}
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">
                    Official Migration Step
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.details}
                </p>
                {step.codeSnippet && (
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto mt-2">
                    <code>{step.codeSnippet}</code>
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: API Differences */}
      {activeSubTab === 'api' && (
        <div className="workspace-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-4 w-1/4">Category</th>
                  <th className="py-2.5 px-4 w-1/3 text-cyan-600 dark:text-cyan-400 font-bold">{fromLibrary} Syntax</th>
                  <th className="py-2.5 px-4 w-1/3 text-indigo-600 dark:text-indigo-400 font-bold">{toLibrary} Target Syntax</th>
                  <th className="py-2.5 px-4">Semantic Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                {apiDifferences.map((api, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 align-top font-mono text-[11px]">
                      {api.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-600 dark:text-cyan-300 align-top">
                      <code>{api.fromApi}</code>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-300 align-top">
                      <code>{api.toApi}</code>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 leading-relaxed align-top text-[11px]">
                      {api.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Dependency Changes */}
      {activeSubTab === 'deps' && (
        <div className="space-y-2">
          {dependencyChanges.map((dep, idx) => (
            <div key={idx} className="p-3 rounded-lg workspace-card-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    dep.action === 'add'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : dep.action === 'remove'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}
                >
                  {dep.action}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {dep.package}
                </span>
              </div>
              <span className="text-slate-500 text-[11px] font-sans">
                {dep.reason}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Testing & Rollback Checklist */}
      {activeSubTab === 'checklist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Testing Checklist */}
          <div className="p-4 rounded-xl workspace-card-subtle space-y-2.5">
            <h4 className="font-mono text-xs uppercase font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Testing Verification Checklist</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {testingChecklist.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-500/20 w-3.5 h-3.5 mt-0.5 accent-brand-500"
                  />
                  <span className="leading-snug text-[11px]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rollback Considerations */}
          <div className="p-4 rounded-xl workspace-card-subtle space-y-2.5">
            <h4 className="font-mono text-xs uppercase font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Rollback & Safety Precautions</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {rollbackConsiderations.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span className="leading-snug text-[11px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
