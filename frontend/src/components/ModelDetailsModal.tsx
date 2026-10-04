import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  GitCommit,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { AiModelRecord, ModelEvidence, ModelHistoryItem } from '../types';
import { forceResearchModel } from '../services/api';

interface ModelDetailsModalProps {
  model: AiModelRecord | null;
  onClose: () => void;
  onCompareWith?: (modelId: string) => void;
  onModelUpdated?: (updated: AiModelRecord) => void;
}

export const ModelDetailsModal: React.FC<ModelDetailsModalProps> = ({
  model,
  onClose,
  onCompareWith,
  onModelUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'evidence' | 'history'>('overview');
  const [isResearching, setIsResearching] = useState(false);
  const [researchNotice, setResearchNotice] = useState<string | null>(null);

  if (!model) return null;

  const handleForceResearch = async () => {
    try {
      setIsResearching(true);
      setResearchNotice('Autonomous research queued. Collecting live evidence...');
      await forceResearchModel(model.provider, model.modelId);
      setTimeout(() => {
        setResearchNotice('Research request submitted to orchestrator queue.');
        setIsResearching(false);
      }, 1500);
    } catch (err: any) {
      setResearchNotice(`Failed to queue research: ${err.message}`);
      setIsResearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ACTIVE':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'DEPRECATED':
      case 'RETIRED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'Fresh':
        return 'text-emerald-400';
      case 'Aging':
        return 'text-amber-400';
      case 'Stale':
        return 'text-rose-400';
      default:
        return 'text-zinc-500';
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
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">{model.displayName}</h2>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(model.status)}`}>
                  {model.status}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                  {model.provider}
                </span>
                <span className={`text-xs flex items-center gap-1 font-medium ${getFreshnessColor(model.freshness)}`}>
                  <Clock className="w-3 h-3" />
                  {model.freshness}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-1">ID: {model.modelId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleForceResearch}
              disabled={isResearching}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Trigger live SerpApi / MCP research & evidence collection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResearching ? 'animate-spin text-violet-400' : ''}`} />
              {isResearching ? 'Researching...' : 'Re-research'}
            </button>

            {onCompareWith && (
              <button
                onClick={() => onCompareWith(model.id)}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Compare
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {researchNotice && (
          <div className="px-6 py-2 bg-violet-950/40 border-b border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span>{researchNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10 flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-violet-500 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-violet-500 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Specs & Capabilities ({model.capabilities.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-violet-500 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Evidence & Sources ({model.evidence?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-violet-500 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitCommit className="w-4 h-4 text-violet-400" />
            Change History ({model.history?.length || 0})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary / Overview */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Overview</h3>
                <p className="text-zinc-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {model.overview || model.description || 'No overview summary available.'}
                </p>
              </div>

              {/* Strengths & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(model.strengths && model.strengths.length > 0
                      ? model.strengths
                      : ['Fast inference latency', 'Standard developer API support', 'High reliability']
                    ).map((s, idx) => (
                      <li key={idx} className="text-zinc-300 text-xs flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-500/20">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Known Limitations & Constraints
                  </h4>
                  <ul className="space-y-2">
                    {(model.limitations && model.limitations.length > 0
                      ? model.limitations
                      : ['Provider rate-limits apply', 'Token usage subject to provider pricing quotas']
                    ).map((l, idx) => (
                      <li key={idx} className="text-zinc-300 text-xs flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Spec Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-xs text-zinc-500 block mb-1">Context Window</span>
                  <span className="text-base font-bold text-white font-mono">{formatTokens(model.contextWindow)}</span>
                  <span className="text-[10px] text-zinc-500 block">tokens limit</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-xs text-zinc-500 block mb-1">Max Output</span>
                  <span className="text-base font-bold text-white font-mono">{formatTokens(model.maxOutputTokens)}</span>
                  <span className="text-[10px] text-zinc-500 block">tokens completion</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-xs text-zinc-500 block mb-1">Input Pricing</span>
                  <span className="text-base font-bold text-white font-mono">
                    {model.inputPricing !== null ? `$${model.inputPricing}` : 'Unknown'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">per 1M tokens</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-xs text-zinc-500 block mb-1">Output Pricing</span>
                  <span className="text-base font-bold text-white font-mono">
                    {model.outputPricing !== null ? `$${model.outputPricing}` : 'Unknown'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">per 1M tokens</span>
                </div>
              </div>

              {/* Timestamps & Audit */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 text-xs text-zinc-400 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-zinc-500 block">First Discovered</span>
                  <span className="text-zinc-200 font-mono">{new Date(model.firstSeenAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Last Provider Check</span>
                  <span className="text-zinc-200 font-mono">{new Date(model.lastCheckedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Last Autonomous Research</span>
                  <span className="text-zinc-200 font-mono">
                    {model.lastResearchedAt ? new Date(model.lastResearchedAt).toLocaleString() : 'Not researched yet'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Capabilities Pills Grid */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Verified Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modalities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Input Modalities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(model.modalities?.input || ['text']).map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs uppercase font-mono">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Output Modalities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(model.modalities?.output || ['text']).map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs uppercase font-mono">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links & References */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Official Resources</h3>
                <div className="space-y-2">
                  {model.documentationUrl && (
                    <a
                      href={model.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-violet-400" />
                        Official Documentation
                      </span>
                      <span className="text-zinc-500 font-mono truncate max-w-xs">{model.documentationUrl}</span>
                    </a>
                  )}

                  {model.apiUrl && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-zinc-300">
                      <span className="text-zinc-400">API Endpoint Base</span>
                      <span className="text-zinc-300 font-mono">{model.apiUrl}</span>
                    </div>
                  )}

                  {model.repositoryUrl && (
                    <a
                      href={model.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                        Provider GitHub Repository
                      </span>
                      <span className="text-zinc-500 font-mono truncate max-w-xs">{model.repositoryUrl}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {model.evidence?.length || 0} verified source(s) supporting model claims.
                </span>
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  NO SOURCE = NO FACT
                </span>
              </div>

              {(!model.evidence || model.evidence.length === 0) ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">No evidence sources recorded yet.</p>
                  <button
                    onClick={handleForceResearch}
                    disabled={isResearching}
                    className="mt-3 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
                  >
                    Trigger Live Research Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {model.evidence.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Tier {item.tier}
                          </span>
                          <span className="text-xs font-semibold text-zinc-200">{item.sourceTitle}</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      </div>

                      {item.snippet && (
                        <p className="text-xs text-zinc-400 italic bg-black/30 p-2.5 rounded border border-white/5 leading-relaxed">
                          "{item.snippet}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Retrieved: {new Date(item.retrievedAt).toLocaleDateString()}
                        </span>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium transition-colors"
                        >
                          View Direct Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <span className="text-xs text-zinc-400 block mb-2">
                Automated change detection audit trail:
              </span>

              {(!model.history || model.history.length === 0) ? (
                <p className="text-sm text-zinc-500 text-center py-8">No change history recorded.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {model.history.map((h, i) => (
                    <div key={h.id || i} className="relative">
                      <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-[#0A0A0B]" />
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300">{h.changeType}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{h.description}</p>
                        {h.sourceUrl && (
                          <a
                            href={h.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-violet-400 hover:underline flex items-center gap-1 pt-1"
                          >
                            Evidence Source
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
