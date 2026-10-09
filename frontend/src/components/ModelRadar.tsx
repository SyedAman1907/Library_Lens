import React, { useState, useEffect } from 'react';
import {
  Radar,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Clock,
  ArrowRightLeft,
  Filter,
  Check,
  TrendingUp,
  Boxes,
  Zap,
  Radio
} from 'lucide-react';
import { AiModelRecord, ModelRadarStats, ModelSyncProgress } from '../types';
import {
  fetchModelRadar,
  fetchModels,
  triggerModelSync,
  fetchModelSyncStatus
} from '../services/api';
import { ModelDetailsModal } from './ModelDetailsModal';
import { ModelCompareModal } from './ModelCompareModal';
import { ModelRecommendationView } from './ModelRecommendationView';

interface ModelRadarProps {
  onSelectModel?: (model: AiModelRecord) => void;
  initialMode?: 'radar' | 'recommendations';
}

export const ModelRadar: React.FC<ModelRadarProps> = ({ onSelectModel, initialMode = 'radar' }) => {
  const [viewMode, setViewMode] = useState<'radar' | 'recommendations'>(initialMode);
  const [stats, setStats] = useState<ModelRadarStats | null>(null);
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<ModelSyncProgress | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'updated' | 'active' | 'deprecated' | 'researched'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapability, setSelectedCapability] = useState<string>('all');

  // Modals
  const [selectedModel, setSelectedModel] = useState<AiModelRecord | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareModelA, setCompareModelA] = useState<string>('');
  const [compareModelB, setCompareModelB] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [radarData, modelsData] = await Promise.all([
        fetchModelRadar(),
        fetchModels()
      ]);
      setStats(radarData);
      setModels(modelsData.models);
    } catch (err) {
      console.error('Failed to load Model Radar data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    try {
      setIsSyncing(true);
      await triggerModelSync(true);

      // Poll sync status until completed
      const pollInterval = setInterval(async () => {
        try {
          const progress = await fetchModelSyncStatus();
          setSyncProgress(progress);
          if (progress.stage === 'completed' || progress.stage === 'error') {
            clearInterval(pollInterval);
            setIsSyncing(false);
            loadData();
          }
        } catch {
          clearInterval(pollInterval);
          setIsSyncing(false);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Sync failed to start', err);
      setIsSyncing(false);
    }
  };

  // Filtered models
  const filteredModels = models.filter((m) => {
    // Tab filter
    if (activeTab === 'new' && m.status !== 'NEW') return false;
    if (activeTab === 'updated' && m.status !== 'UPDATED') return false;
    if (activeTab === 'active' && m.status !== 'ACTIVE') return false;
    if (activeTab === 'deprecated' && m.status !== 'DEPRECATED' && m.status !== 'RETIRED') return false;
    if (activeTab === 'researched' && m.researchStatus !== 'completed') return false;

    // Provider filter
    if (selectedProvider !== 'all' && m.provider.toLowerCase() !== selectedProvider.toLowerCase()) {
      return false;
    }

    // Capability filter
    if (selectedCapability !== 'all' && !m.capabilities.includes(selectedCapability as any)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.displayName.toLowerCase().includes(q) ||
        m.modelId.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.capabilities.some(c => c.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return 'Unknown';
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
    if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
    return tokens.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#F0EBFF] text-[#6841D8] border border-[#DDD3FF] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#6841D8]" />
            NEW MODEL
          </span>
        );
      case 'UPDATED':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            UPDATED
          </span>
        );
      case 'DEPRECATED':
      case 'RETIRED':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            DEPRECATED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#F8F8FA] text-[#52525B] border border-[#E5E7EB] dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
            ACTIVE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Switcher Bar */}
      <div className="flex items-center justify-between p-1 rounded-xl bg-[#FFFDF9] dark:bg-white/[0.04] border border-[#F0DED7] dark:border-white/[0.08] max-w-sm shadow-xs">
        <button
          onClick={() => setViewMode('recommendations')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'recommendations'
              ? 'bg-white dark:bg-[#141010] text-[#EC4899] shadow-xs border border-[#FCE7F3] dark:border-transparent font-bold'
              : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#241414] dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
          <span>✦ AI Recommender</span>
        </button>
        <button
          onClick={() => setViewMode('radar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'radar'
              ? 'bg-[#E63946] text-white shadow-xs font-bold'
              : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#241414] dark:hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Model Radar</span>
        </button>
      </div>

      {viewMode === 'recommendations' ? (
        <ModelRecommendationView onSelectModel={onSelectModel} />
      ) : (
        <>
          {/* Header & Dashboard Stats Bar */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#100D0D] border border-[#F0DED7] dark:border-white/10 shadow-[0_8px_30px_rgba(36,20,20,0.04)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] dark:bg-red-500/10 border border-[#FECDD3] dark:border-red-500/20 text-[#E63946] dark:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Radio className="w-3 h-3 text-[#E63946] animate-pulse" />
                Live Multi-Provider Discovery
              </span>
              {stats?.lastSynchronizedAt && (
                <span className="text-xs text-[#71717A] flex items-center gap-1 font-mono">
                  ● Last sync: {new Date(stats.lastSynchronizedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#241414] dark:text-white flex items-center gap-3 font-display">
              Stay ahead of new models.
            </h1>
            <p className="text-sm text-[#52525B] dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              LibraryLens continuously monitors supported AI providers and discovers new model releases and changes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompareModelA(models[0]?.id || '');
                setCompareModelB(models[1]?.id || '');
                setCompareModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FDF9F7] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#F0DED7] dark:border-white/10 text-xs font-semibold text-[#241414] dark:text-zinc-200 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#E63946]" />
              Compare Models
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="btn-primary-red px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronizing...' : 'Refresh Models'}
            </button>
          </div>
        </div>

        {/* Sync Progress Indicator Banner */}
        {isSyncing && syncProgress && (
          <div className="mt-6 p-4 rounded-xl bg-[#F7F5FF] dark:bg-violet-950/40 border border-[#DDD3FF] dark:border-violet-500/30 text-xs text-[#5B3FD6] dark:text-violet-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#6D4AFF] border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <span className="font-semibold block">{syncProgress.message}</span>
                <span className="text-[10px] text-[#71717A] dark:text-zinc-400">
                  Discovered: {syncProgress.modelsDiscovered} | New: {syncProgress.newModelsDetected} | Updated: {syncProgress.updatedModelsDetected}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#F0EBFF] dark:bg-violet-500/20 text-[#6941D9] dark:text-violet-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
              {syncProgress.stage}
            </span>
          </div>
        )}

        {/* Radar Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#E5E7EB] dark:border-white/5">
          <div className="p-3 bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/5 rounded-xl">
            <span className="text-xs text-[#71717A] block font-medium">Tracked Models</span>
            <span className="text-2xl font-black text-[#111114] dark:text-white font-mono">{stats?.totalTracked ?? models.length}</span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">New Detected</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{stats?.newCount ?? 0}</span>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <span className="text-xs text-blue-700 dark:text-blue-400 font-medium block">Updated</span>
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">{stats?.updatedCount ?? 0}</span>
          </div>

          <div className="p-3 bg-[#FFF1F2] dark:bg-red-950/20 border border-[#FECDD3] dark:border-red-500/20 rounded-xl">
            <span className="text-xs text-[#E63946] dark:text-red-400 font-medium block">Active</span>
            <span className="text-2xl font-black text-[#E63946] dark:text-red-400 font-mono">{stats?.activeCount ?? models.length}</span>
          </div>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-xl">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium block">Deprecated</span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">{stats?.deprecatedCount ?? 0}</span>
          </div>

          <div className="p-3 bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#F0DED7] dark:border-white/5 rounded-xl">
            <span className="text-xs text-[#71717A] block font-medium">Researched</span>
            <span className="text-2xl font-black text-[#241414] dark:text-white font-mono">
              {stats?.recentlyResearchedCount ?? models.filter(m => m.researchStatus === 'completed').length}
            </span>
          </div>
        </div>

        {/* Live Provider Health Bar */}
        <div className="mt-6 pt-4 border-t border-[#F0DED7] dark:border-white/5 flex items-center justify-between flex-wrap gap-3 text-xs">
          <span className="text-[#71717A] font-semibold uppercase tracking-wider text-[10px]">
            Provider Connections:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {(stats?.providers && stats.providers.length > 0 ? stats.providers : [
              { provider: 'google', displayName: 'Google', status: 'connected' as const, enabled: true, modelCount: 0, lastCheckedAt: null, errorMessage: undefined },
              { provider: 'openai', displayName: 'OpenAI', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' },
              { provider: 'anthropic', displayName: 'Anthropic', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' },
              { provider: 'mistral', displayName: 'Mistral', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' },
              { provider: 'groq', displayName: 'Groq', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' },
              { provider: 'openrouter', displayName: 'OpenRouter', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' },
              { provider: 'cohere', displayName: 'Cohere', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' },
              { provider: 'together', displayName: 'Together', status: 'disabled' as const, enabled: false, modelCount: 0, lastCheckedAt: null, errorMessage: 'API key not configured' }
            ]).map((p) => {
              const isConn = p.status === 'connected';
              const isErr = p.status === 'error';
              return (
                <span
                  key={p.provider}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border ${
                    isConn
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      : isErr
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      : 'bg-[#FFFDF9] text-[#71717A] border-[#F0DED7] dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                  }`}
                  title={p.errorMessage || (isConn ? 'Connected & operational' : 'API key not configured')}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConn ? 'bg-emerald-500 animate-pulse' : isErr ? 'bg-rose-500' : 'bg-[#A1A1AA]'
                    }`}
                  />
                  {p.displayName}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFDF9] dark:bg-zinc-900 border border-[#F0DED7] dark:border-white/10 rounded-xl overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'all' ? 'bg-[#E63946] text-white font-semibold shadow-xs' : 'text-[#52525B] dark:text-zinc-400 hover:text-[#241414] dark:hover:text-white'
              }`}
            >
              All Models ({models.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'new' ? 'bg-[#E63946] text-white font-semibold shadow-xs' : 'text-[#52525B] dark:text-zinc-400 hover:text-[#241414] dark:hover:text-white'
              }`}
            >
              New ({stats?.newCount ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('updated')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'updated' ? 'bg-[#E63946] text-white font-semibold shadow-xs' : 'text-[#52525B] dark:text-zinc-400 hover:text-[#241414] dark:hover:text-white'
              }`}
            >
              Updated ({stats?.updatedCount ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'active' ? 'bg-[#E63946] text-white font-semibold shadow-xs' : 'text-[#52525B] dark:text-zinc-400 hover:text-[#241414] dark:hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('deprecated')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'deprecated' ? 'bg-[#E63946] text-white font-semibold shadow-xs' : 'text-[#52525B] dark:text-zinc-400 hover:text-[#241414] dark:hover:text-white'
              }`}
            >
              Deprecated
            </button>
            <button
              onClick={() => setActiveTab('researched')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'researched' ? 'bg-[#E63946] text-white font-semibold shadow-xs' : 'text-[#52525B] dark:text-zinc-400 hover:text-[#241414] dark:hover:text-white'
              }`}
            >
              Researched
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, provider, capability..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-[#D9DCE3] dark:border-white/10 rounded-xl text-xs text-[#111114] dark:text-zinc-200 placeholder-[#71717A] focus:outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/10"
            />
          </div>
        </div>

        {/* Secondary Filter Chips: Provider & Capability */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#71717A] text-[11px] font-semibold uppercase tracking-wider">Provider:</span>
          {['all', 'google', 'openai', 'anthropic', 'mistral', 'groq', 'openrouter', 'cohere', 'together'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition-colors ${
                selectedProvider === p
                  ? 'bg-[#F2EEFF] text-[#5B3FD6] border-[#DDD3FF] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 font-semibold'
                  : 'bg-white dark:bg-white/[0.02] text-[#52525B] dark:text-zinc-400 border-[#E5E7EB] dark:border-white/5 hover:bg-[#F8F8FA] hover:text-[#111114]'
              }`}
            >
              {p}
            </button>
          ))}

          <span className="text-[#71717A] text-[11px] font-semibold uppercase tracking-wider ml-2">Capability:</span>
          {['all', 'Vision', 'Reasoning', 'Code', 'Audio', 'Tool Calling', 'Long Context'].map((cap) => (
            <button
              key={cap}
              onClick={() => setSelectedCapability(cap)}
              className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                selectedCapability === cap
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold'
                  : 'bg-white dark:bg-white/[0.02] text-[#52525B] dark:text-zinc-400 border-[#E5E7EB] dark:border-white/5 hover:bg-[#F8F8FA] hover:text-[#111114]'
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#6D4AFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#71717A]">Loading AI Model Radar intelligence...</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E5E7EB] dark:border-white/10 rounded-2xl p-8 bg-white dark:bg-transparent">
          <Radar className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#111114] dark:text-white mb-1">No AI Models Match Filter</h3>
          <p className="text-xs text-[#52525B] dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query, provider filters, or click Refresh Models to poll live catalogs.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('all');
              setSelectedCapability('all');
              setActiveTab('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#F8F8FA] border border-[#D9DCE3] text-xs font-semibold text-[#111114] hover:bg-[#F1F1F5] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className="group p-5 rounded-2xl bg-white dark:bg-[#0A0A0B] hover:bg-[#FAF9FF] dark:hover:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/10 hover:border-[#6D4AFF]/40 transition-all cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between relative overflow-hidden"
            >
              {model.status === 'NEW' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-xl pointer-events-none rounded-full" />
              )}

              <div>
                {/* Top Bar: Provider & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#F8F8FA] dark:bg-zinc-800 text-[#52525B] dark:text-zinc-300 border border-[#E5E7EB] dark:border-zinc-700 uppercase tracking-wider">
                    {model.provider}
                  </span>
                  {getStatusBadge(model.status)}
                </div>

                {/* Model Title & Description */}
                <h3 className="text-base font-bold text-[#111114] dark:text-white group-hover:text-[#6D4AFF] transition-colors tracking-tight">
                  {model.displayName}
                </h3>
                <p className="text-xs text-[#52525B] dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {model.description || model.overview || `${model.provider.toUpperCase()} artificial intelligence model`}
                </p>

                {/* Key Specs Pills */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#E5E7EB] dark:border-white/5">
                  <div className="p-2 bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-transparent rounded-lg">
                    <span className="text-[10px] text-[#71717A] block">Context Window</span>
                    <span className="text-xs font-bold text-[#111114] dark:text-zinc-200 font-mono">
                      {formatTokens(model.contextWindow)}
                    </span>
                  </div>

                  <div className="p-2 bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-transparent rounded-lg">
                    <span className="text-[10px] text-[#71717A] block">Pricing / 1M</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-zinc-200 font-mono">
                      {model.inputPricing !== null ? `$${model.inputPricing}` : 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Capabilities Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {model.capabilities.slice(0, 4).map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F8F8FA] border border-[#E5E7EB] text-[#52525B] dark:bg-zinc-900 dark:border-white/5 dark:text-zinc-400"
                    >
                      {cap}
                    </span>
                  ))}
                  {model.capabilities.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#71717A]">
                      +{model.capabilities.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-[#E5E7EB] dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#71717A] flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {model.freshness}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#6D4AFF] group-hover:underline flex items-center gap-1">
                    View Specs
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Details Modal */}
      {selectedModel && (
        <ModelDetailsModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          onCompareWith={(modelId) => {
            setCompareModelA(modelId);
            setCompareModelB(models.find(m => m.id !== modelId)?.id || '');
            setSelectedModel(null);
            setCompareModalOpen(true);
          }}
          onModelUpdated={(updated) => {
            setSelectedModel(updated);
            setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
          }}
        />
      )}

      {/* Model Comparison Modal */}
      {compareModalOpen && (
        <ModelCompareModal
          initialModelA={compareModelA}
          initialModelB={compareModelB}
          modelsList={models}
          onClose={() => setCompareModalOpen(false)}
        />
      )}
        </>
      )}
    </div>
  );
};
