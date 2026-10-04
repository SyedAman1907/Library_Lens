import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { AiModelRecord, ModelComparisonResult } from '../types';
import { compareAiModels } from '../services/api';

interface ModelCompareModalProps {
  initialModelA?: string;
  initialModelB?: string;
  modelsList: AiModelRecord[];
  onClose: () => void;
}

export const ModelCompareModal: React.FC<ModelCompareModalProps> = ({
  initialModelA,
  initialModelB,
  modelsList,
  onClose
}) => {
  const [selectedA, setSelectedA] = useState<string>(
    initialModelA || (modelsList[0]?.id || '')
  );
  const [selectedB, setSelectedB] = useState<string>(
    initialModelB || (modelsList[1]?.id || modelsList[0]?.id || '')
  );

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ModelComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      runComparison(selectedA, selectedB);
    }
  }, [selectedA, selectedB]);

  const runComparison = async (modelA: string, modelB: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await compareAiModels(modelA, modelB);
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Failed to compare models');
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return 'Unknown';
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
    if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
    return tokens.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Model Empirical Comparison</h2>
              <p className="text-xs text-zinc-400">Side-by-side evidence, capabilities, and context limits</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Selectors Bar */}
        <div className="p-4 bg-white/[0.01] border-b border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Model A
            </label>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              {modelsList.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.provider.toUpperCase()}] {m.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Model B
            </label>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              {modelsList.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.provider.toUpperCase()}] {m.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Comparing model evidence & capabilities...</p>
            </div>
          ) : comparison ? (
            <div className="space-y-6">
              {/* Header Spec Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {comparison.modelA.provider}
                    </span>
                    <span className="text-xs text-zinc-400">{comparison.modelA.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{comparison.modelA.displayName}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {comparison.modelA.overview || comparison.modelA.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {comparison.modelB.provider}
                    </span>
                    <span className="text-xs text-zinc-400">{comparison.modelB.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{comparison.modelB.displayName}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {comparison.modelB.overview || comparison.modelB.description}
                  </p>
                </div>
              </div>

              {/* Metrics Head-to-Head */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Metrics & Limits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-xs text-zinc-500 block mb-1">Context Window</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white font-mono">{formatTokens(comparison.modelA.contextWindow)}</span>
                      <span className="text-xs text-zinc-500">vs</span>
                      <span className="font-bold text-white font-mono">{formatTokens(comparison.modelB.contextWindow)}</span>
                    </div>
                    {comparison.comparison.contextRatio && (
                      <span className="text-[10px] text-violet-400 block mt-1">
                        Ratio: {comparison.comparison.contextRatio}x
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-xs text-zinc-500 block mb-1">Input Pricing (1M tokens)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white font-mono">
                        {comparison.modelA.inputPricing !== null ? `$${comparison.modelA.inputPricing}` : 'Unknown'}
                      </span>
                      <span className="text-xs text-zinc-500">vs</span>
                      <span className="font-bold text-white font-mono">
                        {comparison.modelB.inputPricing !== null ? `$${comparison.modelB.inputPricing}` : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-xs text-zinc-500 block mb-1">Output Pricing (1M tokens)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white font-mono">
                        {comparison.modelA.outputPricing !== null ? `$${comparison.modelA.outputPricing}` : 'Unknown'}
                      </span>
                      <span className="text-xs text-zinc-500">vs</span>
                      <span className="font-bold text-white font-mono">
                        {comparison.modelB.outputPricing !== null ? `$${comparison.modelB.outputPricing}` : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities Diff */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Capabilities Breakdown</h4>

                {/* Shared */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-semibold text-zinc-400 block mb-2">
                    Shared Capabilities ({comparison.comparison.sharedCapabilities.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {comparison.comparison.sharedCapabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Unique in A & B */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-violet-950/10 border border-violet-500/20">
                    <span className="text-xs font-semibold text-violet-300 block mb-2">
                      Unique to {comparison.modelA.displayName} ({comparison.comparison.onlyInA.length})
                    </span>
                    {comparison.comparison.onlyInA.length === 0 ? (
                      <span className="text-xs text-zinc-500">None detected</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.comparison.onlyInA.map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs font-medium"
                          >
                            + {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-violet-950/10 border border-violet-500/20">
                    <span className="text-xs font-semibold text-violet-300 block mb-2">
                      Unique to {comparison.modelB.displayName} ({comparison.comparison.onlyInB.length})
                    </span>
                    {comparison.comparison.onlyInB.length === 0 ? (
                      <span className="text-xs text-zinc-500">None detected</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.comparison.onlyInB.map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs font-medium"
                          >
                            + {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified Sources Comparison */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Evidence citations: {comparison.modelA.displayName} ({comparison.modelA.evidence?.length || 0})</span>
                  <span>vs</span>
                  <span>{comparison.modelB.displayName} ({comparison.modelB.evidence?.length || 0})</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-xs text-zinc-500">
              Select two different AI models above to run empirical comparison.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
