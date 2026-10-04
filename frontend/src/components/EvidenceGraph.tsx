import React, { useState, useMemo } from 'react';
import { Evidence, Source } from '../types';
import { ShieldCheck, ExternalLink, Filter, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface EvidenceGraphProps {
  evidence?: Evidence[];
  sources?: Source[];
  onSelectSource?: (source: Source) => void;
  onChallengeClaim?: (claim: Evidence) => void;
}

const DEFAULT_SOURCES: Source[] = [
  {
    id: 'src_gemini_docs',
    title: 'Google DeepMind — Gemini 2.5 Flash Architecture & Long Context',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini',
    publisher: 'Google DeepMind',
    library: 'Gemini 2.5 Flash',
    sourceType: 'official_docs',
    tier: 1,
    snippet: 'Gemini 2.5 Flash features a 1,000,000 token default context window with native multimodal token ingestion, sub-second TTFT, and structured JSON output mode.',
    retrievedAt: new Date().toISOString(),
    publishedAt: '2025-05-15',
    confidence: 0.99,
  },
  {
    id: 'src_anthropic_docs',
    title: 'Anthropic Claude 3.5 Sonnet Tool Use & Computer Use Documentation',
    url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
    publisher: 'Anthropic',
    library: 'Claude 3.5 Sonnet',
    sourceType: 'official_docs',
    tier: 1,
    snippet: 'Claude 3.5 Sonnet operates with schema-enforced tool execution, multi-step agent reasoning, and state-of-the-art code generation benchmarks.',
    retrievedAt: new Date().toISOString(),
    publishedAt: '2025-06-20',
    confidence: 0.98,
  },
  {
    id: 'src_tanstack_query',
    title: 'TanStack Query v5 Official Release Migration Guide',
    url: 'https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5',
    publisher: 'TanStack',
    library: 'React Query v5',
    sourceType: 'official_docs',
    tier: 1,
    snippet: 'In TanStack Query v5, callbacks like onSuccess and onError were removed from useQuery in favor of global cache subscriptions to prevent race conditions.',
    retrievedAt: new Date().toISOString(),
    publishedAt: '2024-10-18',
    confidence: 0.97,
  },
  {
    id: 'src_swr_docs',
    title: 'Vercel SWR: Stale-While-Revalidate Data Fetching in React',
    url: 'https://swr.vercel.app/docs/revalidation',
    publisher: 'Vercel',
    library: 'SWR',
    sourceType: 'official_docs',
    tier: 1,
    snippet: 'SWR prioritizes cache delivery first, then initiates background revalidation requests with lightweight memory footprint.',
    retrievedAt: new Date().toISOString(),
    publishedAt: '2024-11-02',
    confidence: 0.96,
  }
];

const DEFAULT_EVIDENCE: Evidence[] = [
  {
    id: 'EVD-01',
    library: 'Gemini 2.5 Flash',
    claim: 'Supports 1M+ token context window with native multimodal processing and sub-dollar per million token cost.',
    sourceIds: ['src_gemini_docs'],
    confidence: 0.99,
    verified: true,
  },
  {
    id: 'EVD-02',
    library: 'Claude 3.5 Sonnet',
    claim: 'Demonstrates leading coding synthesis and schema-validated tool calling for multi-file agents.',
    sourceIds: ['src_anthropic_docs'],
    confidence: 0.98,
    verified: true,
  },
  {
    id: 'EVD-03',
    library: 'React Query v5',
    claim: 'Removed onSuccess/onError hooks from useQuery to enforce deterministic cache synchronization.',
    sourceIds: ['src_tanstack_query'],
    confidence: 0.97,
    verified: true,
  },
  {
    id: 'EVD-04',
    library: 'SWR',
    claim: 'Provides zero-config stale-while-revalidate caching with automatic revalidation on window focus and network reconnect.',
    sourceIds: ['src_swr_docs'],
    confidence: 0.96,
    verified: true,
  }
];

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  evidence = [],
  sources = [],
  onSelectSource,
  onChallengeClaim,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<'all' | 'verified' | 'tier1'>('all');

  const effectiveEvidence = evidence && evidence.length > 0 ? evidence : DEFAULT_EVIDENCE;
  const effectiveSources = sources && sources.length > 0 ? sources : DEFAULT_SOURCES;

  // Filter evidence
  const filteredEvidence = useMemo(() => {
    let list = effectiveEvidence.slice(0, 8); // Top 8 claims for clean visual graph
    if (filterState === 'verified') {
      list = list.filter((e) => e.verified);
    }
    return list;
  }, [effectiveEvidence, filterState]);

  // Source map for quick lookup
  const sourceMap = useMemo(() => {
    const map = new Map<string, Source>();
    effectiveSources.forEach((s) => map.set(s.id, s));
    return map;
  }, [effectiveSources]);

  // Unique relevant sources referenced by the filtered claims
  const relevantSources = useMemo(() => {
    const ids = new Set<string>();
    filteredEvidence.forEach((e) => {
      e.sourceIds?.forEach((id) => ids.add(id));
    });

    let list = Array.from(ids)
      .map((id) => sourceMap.get(id))
      .filter((s): s is Source => Boolean(s));

    if (filterState === 'tier1') {
      list = list.filter((s) => s.tier === 1);
    }

    return list.slice(0, 10);
  }, [filteredEvidence, sourceMap, filterState]);

  // Determine active highlights
  const activeClaim = filteredEvidence.find((e) => e.id === selectedClaimId);
  const activeSource = relevantSources.find((s) => s.id === selectedSourceId);

  const highlightedSourceIds = useMemo(() => {
    if (activeClaim) {
      return new Set(activeClaim.sourceIds || []);
    }
    if (activeSource) {
      return new Set([activeSource.id]);
    }
    return new Set<string>();
  }, [activeClaim, activeSource]);

  const highlightedClaimIds = useMemo(() => {
    if (activeSource) {
      const set = new Set<string>();
      filteredEvidence.forEach((e) => {
        if (e.sourceIds?.includes(activeSource.id)) {
          set.add(e.id);
        }
      });
      return set;
    }
    if (activeClaim) {
      return new Set([activeClaim.id]);
    }
    return new Set<string>();
  }, [activeSource, activeClaim, filteredEvidence]);

  const hasSelection = Boolean(selectedClaimId || selectedSourceId);

  return (
    <div className="workspace-card p-6 space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-brand-500 font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Bi-Directional Graph</span>
          </div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Evidence-to-Source Verification Graph
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any factual claim to reveal supporting primary sources, or click a source to audit the claims it anchors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => {
              setFilterState('all');
              setSelectedClaimId(null);
              setSelectedSourceId(null);
            }}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterState === 'all'
                ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white font-bold shadow-subtle'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Nodes
          </button>
          <button
            onClick={() => {
              setFilterState('verified');
              setSelectedClaimId(null);
              setSelectedSourceId(null);
            }}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterState === 'verified'
                ? 'bg-white dark:bg-white/[0.1] text-emerald-600 dark:text-emerald-400 font-bold shadow-subtle'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Verified Only
          </button>
          <button
            onClick={() => {
              setFilterState('tier1');
              setSelectedClaimId(null);
              setSelectedSourceId(null);
            }}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterState === 'tier1'
                ? 'bg-white dark:bg-white/[0.1] text-cyan-600 dark:text-cyan-400 font-bold shadow-subtle'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tier 1 Docs
          </button>
        </div>
      </div>

      {/* Interactive Two-Column Visual Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Left Column: Claims */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase text-slate-400 dark:text-slate-500 pb-1">
            <span>Claims ({filteredEvidence.length})</span>
            <span className="text-[10px] text-brand-500 lowercase">click claim to isolate sources</span>
          </div>

          <div className="space-y-2.5">
            {filteredEvidence.map((item) => {
              const isSelected = selectedClaimId === item.id;
              const isHighlighted = highlightedClaimIds.has(item.id);
              const isDimmed = hasSelection && !isHighlighted;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (selectedClaimId === item.id) {
                      setSelectedClaimId(null);
                    } else {
                      setSelectedClaimId(item.id);
                      setSelectedSourceId(null);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 text-slate-900 dark:text-white shadow-glow'
                      : isHighlighted
                      ? 'bg-slate-100 dark:bg-white/[0.06] border-brand-500/50 text-slate-800 dark:text-slate-100'
                      : isDimmed
                      ? 'opacity-40 border-slate-200/50 dark:border-white/[0.03] bg-transparent'
                      : 'workspace-card-subtle hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {item.library} • {item.id}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.verified
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {item.verified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>

                  <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug mb-2">
                    "{item.claim}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.04] text-[11px] font-mono">
                    <span className="text-slate-400">
                      Anchored by {item.sourceIds?.length || 0} source(s)
                    </span>
                    {onChallengeClaim && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChallengeClaim(item);
                        }}
                        className="text-brand-500 hover:text-brand-400 font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        Challenge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Anchoring Sources */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase text-slate-400 dark:text-slate-500 pb-1">
            <span>Anchoring Sources ({relevantSources.length})</span>
            <span className="text-[10px] text-cyan-500 lowercase">click source to trace claims</span>
          </div>

          <div className="space-y-2.5">
            {relevantSources.map((source) => {
              const isSelected = selectedSourceId === source.id;
              const isHighlighted = highlightedSourceIds.has(source.id);
              const isDimmed = hasSelection && !isHighlighted;
              const isTier1 = source.tier === 1;

              return (
                <div
                  key={source.id}
                  onClick={() => {
                    if (selectedSourceId === source.id) {
                      setSelectedSourceId(null);
                    } else {
                      setSelectedSourceId(source.id);
                      setSelectedClaimId(null);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 text-slate-900 dark:text-white shadow-glow'
                      : isHighlighted
                      ? 'bg-slate-100 dark:bg-white/[0.06] border-cyan-500/50 text-slate-800 dark:text-slate-100'
                      : isDimmed
                      ? 'opacity-40 border-slate-200/50 dark:border-white/[0.03] bg-transparent'
                      : 'workspace-card-subtle hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      [{source.id}] {source.publisher}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isTier1
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : source.tier === 2
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      {isTier1 ? 'TIER 1 PRIMARY' : `TIER ${source.tier}`}
                    </span>
                  </div>

                  <h5 className="font-semibold text-slate-900 dark:text-white leading-snug line-clamp-1 mb-1">
                    {source.title}
                  </h5>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {source.snippet}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.04] text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {source.sourceType}
                    </span>
                    <div className="flex items-center gap-2">
                      {onSelectSource && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSource(source);
                          }}
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono text-[10px]"
                        >
                          Inspect
                        </button>
                      )}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-brand-500 hover:underline font-mono text-[10px]"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Helper Banner */}
      {hasSelection && (
        <div className="p-3 rounded-lg bg-brand-500/5 border border-brand-500/20 flex items-center justify-between text-xs text-brand-600 dark:text-brand-300 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500" />
            <span>
              {activeClaim
                ? `Tracing claim ${activeClaim.id}: Connected to ${highlightedSourceIds.size} supporting source(s)`
                : `Auditing source ${activeSource?.id}: Supporting ${highlightedClaimIds.size} factual claim(s)`}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedClaimId(null);
              setSelectedSourceId(null);
            }}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] underline cursor-pointer"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};
