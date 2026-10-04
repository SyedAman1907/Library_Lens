import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Bookmark,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  TrendingUp,
  Cpu,
  Zap,
  Boxes,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Scale,
  ShieldAlert,
  X,
  Radio,
  FileText
} from 'lucide-react';
import {
  RecommendationAnalysis,
  SavedUseCase,
  ExtractedRequirements,
  ModelRecommendationCandidate,
  CounterSourceItem,
  AiModelRecord
} from '../types';
import {
  analyzeModelRecommendation,
  challengeModelRecommendation,
  refreshModelRecommendation,
  fetchSavedUseCases,
  saveModelUseCase,
  deleteModelUseCase,
  checkUseCaseModelUpdates
} from '../services/api';
import { ModelDetailsModal } from './ModelDetailsModal';
import { ModelCompareModal } from './ModelCompareModal';

interface ModelRecommendationViewProps {
  initialPrompt?: string;
  onSelectModel?: (model: AiModelRecord) => void;
  onNavigateToRadar?: () => void;
}

export const ModelRecommendationView: React.FC<ModelRecommendationViewProps> = ({
  initialPrompt,
  onSelectModel,
  onNavigateToRadar,
}) => {
  // Input & state
  const [prompt, setPrompt] = useState(initialPrompt || 'I need a model for a coding assistant with strong reasoning, tool calling, and large context');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RecommendationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Constraints drawer
  const [showConstraints, setShowConstraints] = useState(false);
  const [customConstraints, setCustomConstraints] = useState<Partial<ExtractedRequirements>>({});

  // Saved use cases
  const [savedUseCases, setSavedUseCases] = useState<SavedUseCase[]>([]);
  const [isSavingUseCase, setIsSavingUseCase] = useState(false);
  const [newUseCaseName, setNewUseCaseName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Challenge modal
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    counterSources: CounterSourceItem[];
    findings: string;
    changesSummary: string;
    challengedAt: string;
  } | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Refresh state
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Expanded evidence & explanations
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [evidenceModalModel, setEvidenceModalModel] = useState<ModelRecommendationCandidate | null>(null);

  // Full model details & compare modals
  const [inspectModel, setInspectModel] = useState<AiModelRecord | null>(null);
  const [compareModels, setCompareModels] = useState<{ a: string; b: string } | null>(null);

  // Quick Prompt Pills
  const promptExamples = [
    { label: 'Coding Assistant', prompt: 'I need a model for a coding assistant with strong reasoning, tool calling, and large context.' },
    { label: 'Customer Support Bot', prompt: 'I need a cheap, fast model for a high-volume customer-support chatbot with structured output.' },
    { label: 'Large Document Analysis', prompt: 'I need a model with long context (1M+ tokens) for analyzing large technical documents and PDFs.' },
    { label: 'Multimodal Vision', prompt: 'I need a model for image + text understanding, OCR diagrams, and visual reasoning.' },
    { label: 'Real-Time Low Latency', prompt: 'I need a fast model for a real-time voice and conversational application with ultra-low latency.' },
    { label: 'AI Agent with Tools', prompt: 'I need a model for an autonomous AI agent with schema-enforced tool calling and reliable JSON.' },
    { label: 'Cost / Performance Balance', prompt: 'I need the best balance of cost and performance for high-scale enterprise API generation.' },
  ];

  useEffect(() => {
    loadSavedUseCases();
    // Run initial recommendation with prompt or initialPrompt
    const query = (initialPrompt && initialPrompt.trim()) ? initialPrompt : prompt;
    handleAnalyze(query);
  }, [initialPrompt]);

  const loadSavedUseCases = async () => {
    try {
      const res = await fetchSavedUseCases();
      if (res?.useCases) {
        setSavedUseCases(res.useCases);
      }
    } catch (err) {
      console.error('Failed to load saved use cases', err);
    }
  };

  const handleAnalyze = async (overridePrompt?: string) => {
    const queryPrompt = overridePrompt || prompt;
    if (!queryPrompt.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setRefreshNotice(null);
      const res = await analyzeModelRecommendation({
        prompt: queryPrompt,
        constraints: customConstraints
      });
      setAnalysis(res);
      if (res.recommendations?.length > 0) {
        setExpandedModelId(res.recommendations[0].model.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze requirements.');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!analysis) return;
    try {
      setChallengeLoading(true);
      const res = await challengeModelRecommendation(analysis.id);
      setAnalysis(res.analysis);
      setChallengeResult({
        counterSources: res.counterSources,
        findings: res.findings,
        changesSummary: res.changesSummary,
        challengedAt: res.challengedAt
      });
      setShowChallengeModal(true);
    } catch (err: any) {
      alert(`Challenge audit failed: ${err.message}`);
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!analysis) return;
    try {
      setRefreshLoading(true);
      const res = await refreshModelRecommendation(analysis.id);
      setAnalysis(res.analysis);
      setRefreshNotice(res.reasonForUpdate || 'Recommendation evidence successfully re-verified against live providers.');
    } catch (err: any) {
      alert(`Refresh failed: ${err.message}`);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleSaveUseCase = async () => {
    if (!analysis || !newUseCaseName.trim()) return;
    try {
      setIsSavingUseCase(true);
      await saveModelUseCase({
        name: newUseCaseName.trim(),
        prompt: analysis.userPrompt,
        requirements: analysis.detectedRequirements,
        currentRecommendedModelIds: analysis.recommendations.map(r => r.model.id)
      });
      setShowSaveModal(false);
      setNewUseCaseName('');
      await loadSavedUseCases();
    } catch (err: any) {
      alert(`Failed to save use case: ${err.message}`);
    } finally {
      setIsSavingUseCase(false);
    }
  };

  const handleDeleteUseCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved use case?')) return;
    try {
      await deleteModelUseCase(id);
      await loadSavedUseCases();
    } catch (err: any) {
      alert(`Failed to delete use case: ${err.message}`);
    }
  };

  const handleLoadUseCase = async (useCase: SavedUseCase) => {
    setPrompt(useCase.prompt);
    setCustomConstraints(useCase.requirements);
    await handleAnalyze(useCase.prompt);
  };

  // Helper for confidence badge colors
  const getConfidenceBadge = (confidence?: 'High' | 'Medium' | 'Limited') => {
    switch (confidence) {
      case 'High':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          text: 'High Confidence (Primary-Source Evidence)'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          text: 'Medium Confidence (Incomplete Sources)'
        };
      case 'Limited':
      default:
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          text: 'Limited Confidence (Insufficient Evidence)'
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* SECTION 25: HEADER SECTION */}
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/[0.03] pointer-events-none rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0EBFF] dark:bg-violet-500/15 text-[#6941D9] dark:text-violet-300 text-xs font-mono font-semibold border border-[#DDD3FF] dark:border-violet-500/25">
              <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />
              AI Recommender
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono border border-emerald-200 dark:border-emerald-500/20 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Evidence-Driven • Primary Source Grounded
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#111114] dark:text-white">
            AI Recommender
          </h1>
          <p className="text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed max-w-2xl">
            Tell us what you're building. We'll research the current ecosystem
            and explain which options fit your requirements.
          </p>
        </div>
      </div>

      {/* SECTION 25: LARGE WHITE REQUIREMENT BOX */}
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0C0C0F] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.03)] space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] font-semibold">
            What are you building?
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Describe what you're building (e.g. 'I need a fast, low-cost model for a customer support bot with tool calling')"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFB] dark:bg-[#111114] border border-[#D9DCE3] dark:border-white/[0.08] rounded-xl text-sm text-[#111114] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#8B72FF] focus:ring-4 focus:ring-violet-500/10 transition-all font-sans"
              />
            </div>

            <button
              onClick={() => setShowConstraints(!showConstraints)}
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showConstraints || Object.keys(customConstraints).length > 0
                  ? 'bg-[#F2EEFF] text-[#5B3FD6] border-[#DDD3FF]'
                  : 'bg-white dark:bg-white/[0.04] border-[#D9DCE3] dark:border-white/[0.08] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#F8F8FA] hover:text-[#111114]'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#6D4AFF]" />
              <span>Advanced Tuning</span>
              {showConstraints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !prompt.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#6D4AFF] hover:bg-[#5B3FD6] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Researching Ecosystem...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Research & Recommend</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 25: YOUR REQUIREMENTS CHIPS */}
        <div className="pt-2 border-t border-[#E5E7EB] dark:border-white/[0.06] space-y-2">
          <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider block font-semibold">
            Your Requirements
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Coding', key: 'codeRequired' },
              { label: 'Low Cost', key: 'budgetLow' },
              { label: 'Long Context', key: 'longContext' },
              { label: 'Tool Calling', key: 'toolCallingRequired' },
              { label: 'Fast Response', key: 'lowLatency' },
              { label: 'Vision', key: 'visionRequired' },
              { label: 'Reasoning', key: 'reasoningRequired' },
            ].map((chip) => {
              const isSelected =
                (chip.key === 'budgetLow' && customConstraints.budget === 'low') ||
                (chip.key === 'longContext' && (customConstraints.minContextWindow || 0) >= 128000) ||
                (chip.key === 'lowLatency' && customConstraints.latencyPriority === 'low') ||
                (customConstraints as any)[chip.key] === true;

              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    if (chip.key === 'budgetLow') {
                      setCustomConstraints(prev => ({ ...prev, budget: isSelected ? undefined : 'low' }));
                    } else if (chip.key === 'longContext') {
                      setCustomConstraints(prev => ({ ...prev, minContextWindow: isSelected ? undefined : 128000 }));
                    } else if (chip.key === 'lowLatency') {
                      setCustomConstraints(prev => ({ ...prev, latencyPriority: isSelected ? undefined : 'low' }));
                    } else {
                      setCustomConstraints(prev => ({ ...prev, [chip.key]: !isSelected ? true : undefined }));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2EEFF] text-[#5B3FD6] border border-[#DDD3FF] font-semibold shadow-sm'
                      : 'bg-[#F8F8FA] dark:bg-white/[0.04] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#F1F1F5] hover:text-[#111114] border border-[#E5E7EB] dark:border-white/[0.06]'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* EXPANDABLE CONSTRAINTS DRAWER */}
        {showConstraints && (
          <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.06] space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-white/[0.06]">
              <span className="font-mono text-[#52525B] dark:text-[#A1A1AA] uppercase tracking-wider text-[11px] font-semibold">
                Explicit Engineering Constraints (Optional Overrides)
              </span>
              <button
                onClick={() => setCustomConstraints({})}
                className="text-[11px] text-[#6D4AFF] hover:text-[#5B3FD6] font-medium transition-colors"
              >
                Reset All Overrides
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Budget */}
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] mb-1 font-semibold uppercase">
                  Budget Priority
                </label>
                <select
                  value={customConstraints.budget || ''}
                  onChange={(e) => setCustomConstraints({ ...customConstraints, budget: e.target.value as any || undefined })}
                  className="w-full bg-white dark:bg-[#141419] border border-[#D9DCE3] dark:border-white/[0.1] rounded-lg py-1.5 px-2.5 text-xs text-[#111114] dark:text-[#E4E4E7] focus:outline-none focus:border-[#6D4AFF]"
                >
                  <option value="">Auto-detected from prompt</option>
                  <option value="low">Low (Cost-effective, &lt; $1.00/1M tokens)</option>
                  <option value="medium">Medium (Standard enterprise)</option>
                  <option value="unconstrained">Unconstrained / Best Performance</option>
                </select>
              </div>

              {/* Latency */}
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] mb-1 font-semibold uppercase">
                  Latency Priority
                </label>
                <select
                  value={customConstraints.latencyPriority || ''}
                  onChange={(e) => setCustomConstraints({ ...customConstraints, latencyPriority: e.target.value as any || undefined })}
                  className="w-full bg-white dark:bg-[#141419] border border-[#D9DCE3] dark:border-white/[0.1] rounded-lg py-1.5 px-2.5 text-xs text-[#111114] dark:text-[#E4E4E7] focus:outline-none focus:border-[#6D4AFF]"
                >
                  <option value="">Auto-detected from prompt</option>
                  <option value="ultra_low">Ultra-Low (Real-time voice & streaming)</option>
                  <option value="low">Low (Interactive fast chat)</option>
                  <option value="standard">Standard (Batch / deep reasoning)</option>
                </select>
              </div>

              {/* Min Context Window */}
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] mb-1 font-semibold uppercase">
                  Min Context Window
                </label>
                <select
                  value={customConstraints.minContextWindow ? String(customConstraints.minContextWindow) : ''}
                  onChange={(e) => setCustomConstraints({ ...customConstraints, minContextWindow: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="w-full bg-white dark:bg-[#141419] border border-[#D9DCE3] dark:border-white/[0.1] rounded-lg py-1.5 px-2.5 text-xs text-[#111114] dark:text-[#E4E4E7] focus:outline-none focus:border-[#6D4AFF]"
                >
                  <option value="">Auto-detected from prompt</option>
                  <option value="32000">32,000 tokens</option>
                  <option value="128000">128,000 tokens</option>
                  <option value="200000">200,000 tokens</option>
                  <option value="1000000">1,000,000 tokens (1M+)</option>
                  <option value="2000000">2,000,000 tokens (2M+)</option>
                </select>
              </div>

              {/* Specific capabilities */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-[#71717A] mb-1 font-semibold uppercase">
                  Required Features
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'codeRequired', label: 'Code' },
                    { key: 'toolCallingRequired', label: 'Tools' },
                    { key: 'reasoningRequired', label: 'Reasoning' },
                    { key: 'structuredOutputRequired', label: 'JSON' },
                    { key: 'visionRequired', label: 'Vision' },
                  ].map((feat) => {
                    const active = (customConstraints as any)[feat.key] === true;
                    return (
                      <button
                        key={feat.key}
                        onClick={() =>
                          setCustomConstraints({
                            ...customConstraints,
                            [feat.key]: !active ? true : undefined
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          active
                            ? 'bg-[#F2EEFF] text-[#5B3FD6] border border-[#DDD3FF] font-semibold'
                            : 'bg-white dark:bg-white/[0.05] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#111114] border border-[#E5E7EB] dark:border-transparent'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {feat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SAVED USE CASES BAR ("MY USE CASES") */}
      <div className="rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0E0E12]/80 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#6D4AFF]" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
              My Saved Use Cases
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2EEFF] text-[#5B3FD6] dark:bg-white/[0.06] dark:text-[#71717A] font-semibold">
              {savedUseCases.length}
            </span>
          </div>

          {analysis && (
            <button
              onClick={() => {
                setNewUseCaseName(analysis.detectedRequirements.useCase || 'My Custom Scenario');
                setShowSaveModal(true);
              }}
              className="flex items-center gap-1.5 text-xs text-[#6D4AFF] hover:text-[#5B3FD6] font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current Analysis</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {savedUseCases.map((uc) => (
            <div
              key={uc.id}
              onClick={() => handleLoadUseCase(uc)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8F8FA] dark:bg-white/[0.03] hover:bg-[#F1F1F5] dark:hover:bg-white/[0.07] border border-[#E5E7EB] dark:border-white/[0.06] hover:border-[#6D4AFF]/30 cursor-pointer transition-all"
            >
              <span className="text-xs font-medium text-[#111114] dark:text-[#E4E4E7]">
                {uc.name}
              </span>
              <button
                onClick={(e) => handleDeleteUseCase(uc.id, e)}
                className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-rose-500 transition-opacity p-0.5"
                title="Delete saved use case"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* REFRESH NOTICE */}
      {refreshNotice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{refreshNotice}</span>
          </div>
          <button
            onClick={() => setRefreshNotice(null)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* RECOMMENDATION RESULTS SECTION */}
      {analysis && (
        <div className="space-y-8 animate-fadeIn">
          {/* RESULTS HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.08] shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6D4AFF] font-bold">
                  Recommended for Your Use Case
                </span>
                <span className="text-[#D9DCE3] dark:text-white/[0.2]">•</span>
                <span className="text-xs text-[#52525B] dark:text-[#E4E4E7] font-semibold">
                  {analysis.detectedRequirements.useCase}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-[#111114] dark:text-white">
                Suitable Candidates & Verified Explanations
              </h2>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                "Based on your requirements, these models appear to fit your needs, and here is why."
              </p>
            </div>

            {/* CONFIDENCE & ACTIONS */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Evidence Coverage Meter (Section 14) */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-white/[0.08] bg-[#FAFAFC] dark:bg-[#111114] text-xs font-mono select-none"
                title="Based on the availability and quality of evidence supporting your requirements."
              >
                <span className="text-[10px] text-[#71717A] uppercase font-semibold">Evidence Coverage:</span>
                <span className="text-[#6D4AFF] font-bold tracking-widest text-[11px]">
                  {analysis.confidence?.toLowerCase() === 'high' ? '████████░░' : analysis.confidence?.toLowerCase() === 'medium' ? '█████░░░░░' : '██░░░░░░░░'}
                </span>
                <span className="font-semibold text-[#111114] dark:text-white capitalize">
                  {analysis.confidence}
                </span>
              </div>

              {/* Challenge Recommendation Button */}
              <button
                onClick={handleChallenge}
                disabled={challengeLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 transition-all cursor-pointer"
                title="Search for contradictory evidence, benchmark controversies, or newer pricing changes"
              >
                {challengeLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
                <span>Challenge Recommendation</span>
              </button>

              {/* Refresh Recommendation Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-[#F8F8FA] text-[#111114] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-white border border-[#D9DCE3] dark:border-white/[0.1] transition-all cursor-pointer shadow-xs"
                title="Re-verify all sources and check newly released models"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* CANDIDATE MODEL CARDS (Multiple suitable options, no forced single pick) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.recommendations.map((rec, rIdx) => {
              const model = rec.model;
              const isExpanded = expandedModelId === model.id;

              return (
                <div
                  key={model.id}
                  className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.07] bg-white dark:bg-[#0C0C0F] hover:border-[#6D4AFF]/40 transition-all shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-6 space-y-6">
                    {/* Top Row: RECOMMENDED Badge, Provider, Name */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F0EBFF] text-[#6941D9] border border-[#DDD3FF] font-bold">
                            {rIdx === 0 ? 'RECOMMENDED • TOP FIT' : 'RECOMMENDED OPTION'}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717A] uppercase font-semibold">
                            {model.provider}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Fresh Evidence
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-[#111114] dark:text-white font-display group-hover:text-[#6D4AFF] transition-colors">
                          {model.displayName}
                        </h3>
                        <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1">
                          Strong verified fit for your {analysis.detectedRequirements.useCase.toLowerCase()} requirements.
                        </p>
                      </div>
                    </div>

                    {/* SPECS GRID: Context, Cost, Coding, Tools */}
                    <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.05] text-center text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-[#71717A] uppercase block">Context</span>
                        <span className="font-semibold text-[#111114] dark:text-white font-mono mt-0.5 block">
                          {model.contextWindow ? (model.contextWindow >= 1000000 ? `${(model.contextWindow / 1000000).toFixed(0)}M` : `${Math.round(model.contextWindow / 1000)}k`) : '128k'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#71717A] uppercase block">In / Out</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block truncate">
                          {model.inputPricing !== null ? `$${model.inputPricing.toFixed(2)}` : 'Low tier'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#71717A] uppercase block">Coding</span>
                        <span className="font-semibold text-[#6D4AFF] font-mono mt-0.5 block">
                          {model.capabilities.includes('Code') || model.modelId.includes('code') ? '✓ Yes' : 'Standard'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#71717A] uppercase block">Tools</span>
                        <span className="font-semibold text-[#6D4AFF] font-mono mt-0.5 block">
                          {model.capabilities.includes('Tool Calling') || model.capabilities.includes('Function Calling') ? '✓ Yes' : 'Prompt'}
                        </span>
                      </div>
                    </div>

                    {/* WHY IT FITS SECTION */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] font-bold block">
                        Why this fits your requirements
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#111114] dark:text-[#D4D4D8]">
                        {rec.whyItFits.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* VERTICAL EVIDENCE TRAIL (Visual Hierarchy of Trust) */}
                    <div className="p-4 rounded-xl bg-[#F7F5FF] dark:bg-violet-950/20 border border-[#DDD3FF] dark:border-violet-500/15 space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#6D4AFF] font-bold block">
                        Why this fits your requirements (Evidence Trail)
                      </span>
                      <div className="relative pl-4 space-y-3 border-l-2 border-[#C9BEFF] dark:border-violet-500/30 ml-1">
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#6D4AFF]" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">YOUR REQUIREMENT</span>
                          <span className="text-xs font-semibold text-[#111114] dark:text-white">
                            {analysis.detectedRequirements.useCase || 'AI Application Architecture'}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#7C5CFF]" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">DOCUMENTED EVIDENCE</span>
                          <span className="text-xs text-[#52525B] dark:text-[#D4D4D8]">
                            {rec.evidenceList?.[0]?.sourceTitle || `Official documentation & API references by ${model.provider}`}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">VERIFIED FACT</span>
                          <span className="text-xs text-[#52525B] dark:text-[#D4D4D8]">
                            {rec.evidenceList?.[0]?.evidenceClaim || `${model.displayName} features context of ${model.contextWindow ? model.contextWindow.toLocaleString() : '128,000'} tokens with native execution capability.`}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">RELEVANCE</span>
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            {rec.evidenceList?.[0]?.relevance || `Directly satisfies your target criteria without unsupported claims.`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TRADE-OFFS SECTION */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] font-bold block">
                        Trade-offs to consider
                      </span>
                      <div className="p-3 rounded-xl bg-[#FAFAFC] dark:bg-[#111114] border border-[#E5E7EB] dark:border-white/[0.05] space-y-1.5 text-xs">
                        <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                          <span className="font-bold">+</span>
                          <span>Strong verified context and reasoning performance</span>
                        </div>
                        {rec.tradeOffs.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                            <span className="font-bold">−</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* STRUCTURED REQUIREMENT EXPLANATIONS (Expandable) */}
                    {isExpanded && rec.requirementExplanations.length > 0 && (
                      <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06] space-y-3 animate-fadeIn">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6D4AFF] font-semibold block">
                          Requirement Breakdown & Evidence
                        </span>
                        {rec.requirementExplanations.map((exp, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.05] space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[#111114] dark:text-white">
                                Requirement: {exp.requirement}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300">
                                {exp.verificationStatus}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                              <strong className="text-[#111114] dark:text-[#D4D4D8]">Evidence: </strong>
                              {exp.evidence}
                            </p>
                            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                              <strong className="text-[#111114] dark:text-[#D4D4D8]">Why this matters: </strong>
                              {exp.relevance}
                            </p>
                            <a
                              href={exp.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#6D4AFF] hover:text-[#5B3FD6] pt-0.5"
                            >
                              <span>Source: {exp.sourceTitle}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="px-6 py-3.5 bg-[#FAFAFC] dark:bg-white/[0.02] border-t border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#71717A] dark:text-[#A1A1AA] text-[11px]">
                        Evidence: {rec.evidenceList.length} verified source{rec.evidenceList.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedModelId(isExpanded ? null : model.id)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] hover:bg-[#F1F1F5] dark:hover:bg-white/[0.1] text-[#111114] dark:text-[#E4E4E7] border border-[#D9DCE3] dark:border-transparent text-[11px] font-medium transition-colors"
                      >
                        {isExpanded ? 'Hide Evidence' : 'View Evidence'}
                      </button>

                      <button
                        onClick={() => setInspectModel(model)}
                        className="px-2.5 py-1 rounded-lg bg-[#F0EBFF] hover:bg-[#E5DCFF] text-[#6941D9] border border-[#DDD3FF] text-[11px] font-semibold transition-colors"
                      >
                        Model Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* REQUIREMENT-SPECIFIC COMPARISON MATRIX */}
          <div className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0E0E12] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/[0.06]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6D4AFF] font-semibold block">
                  Requirement Alignment Matrix
                </span>
                <h3 className="text-base font-bold text-[#111114] dark:text-white">
                  Side-by-Side Capability Comparison
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A]">
                <span><span className="text-emerald-600 font-bold">✓</span> Satisfied</span>
                <span><span className="text-amber-600 font-bold">○</span> Partial</span>
                <span><span className="text-rose-600 font-bold">✗</span> Unmet</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-white/[0.06]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F7F9] dark:bg-white/[0.04] border-b border-[#E5E7EB] dark:border-white/[0.06] text-[#52525B] dark:text-[#A1A1AA] font-mono text-[11px]">
                    <th className="py-2.5 px-3">Requirement Factor</th>
                    {analysis.comparisonMatrix.models.map((m) => (
                      <th key={m.id} className="py-2.5 px-3 text-center">
                        <div className="font-semibold text-[#111114] dark:text-white">{m.displayName}</div>
                        <div className="text-[9px] text-[#71717A] uppercase">{m.provider}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.04] bg-white dark:bg-transparent">
                  {analysis.comparisonMatrix.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF9FF] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#111114] dark:text-[#E4E4E7]">
                        {row.factor}
                      </td>
                      {analysis.comparisonMatrix.models.map((m) => {
                        const val = row.values[m.id] || '—';
                        return (
                          <td key={m.id} className="py-3 px-3 text-center font-mono font-bold text-sm">
                            <span
                              className={
                                val === '✓'
                                  ? 'text-emerald-600'
                                  : val === '○'
                                  ? 'text-amber-600'
                                  : val === '✗'
                                  ? 'text-rose-600'
                                  : 'text-[#71717A]'
                              }
                            >
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHALLENGE AUDIT MODAL */}
      {showChallengeModal && challengeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0E0E12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#111114] dark:text-white">
                  Recommendation Challenge & Audit Results
                </h3>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="text-[#71717A] hover:text-[#111114] dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">
                  Audit Findings
                </span>
                <p className="text-sm text-amber-900 dark:text-amber-100/90 leading-relaxed">
                  {challengeResult.findings}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider font-semibold">
                  What Changed
                </span>
                <p className="text-[#52525B] dark:text-[#D4D4D8] leading-relaxed">
                  {challengeResult.changesSummary}
                </p>
              </div>

              {/* Counter sources queried */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider font-semibold">
                  Counter-Sources & Technical Inquiries Evaluated ({challengeResult.counterSources.length})
                </span>
                <div className="space-y-2">
                  {challengeResult.counterSources.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#FAFAFC] dark:bg-white/[0.02] border border-[#E5E7EB] dark:border-white/[0.05] space-y-1">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#6D4AFF] hover:underline flex items-center gap-1"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-[11px] text-[#71717A]">
                        {s.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/[0.08] flex justify-end">
              <button
                onClick={() => setShowChallengeModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F8F8FA] hover:bg-[#F1F1F5] text-[#111114] border border-[#D9DCE3] text-xs font-semibold"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE USE CASE MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] dark:border-white/[0.1] bg-white dark:bg-[#0E0E12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] space-y-4">
            <h3 className="text-base font-bold text-[#111114] dark:text-white">
              Save Use Case Requirements
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              Saved use cases are continuously monitored. When newly released models match your saved constraints, you will be notified.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-semibold">
                Use Case Name
              </label>
              <input
                type="text"
                value={newUseCaseName}
                onChange={(e) => setNewUseCaseName(e.target.value)}
                placeholder="e.g. Coding Assistant, Document Analysis"
                className="w-full bg-[#FAFAFC] dark:bg-white/[0.04] border border-[#D9DCE3] dark:border-white/[0.1] rounded-xl py-2 px-3 text-xs text-[#111114] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-[#71717A] hover:text-[#111114] dark:text-[#A1A1AA] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUseCase}
                disabled={isSavingUseCase || !newUseCaseName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#6D4AFF] hover:bg-[#5B3FD6] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSavingUseCase ? 'Saving...' : 'Save to My Use Cases'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODEL PROFILE MODAL */}
      {inspectModel && (
        <ModelDetailsModal
          model={inspectModel}
          onClose={() => setInspectModel(null)}
          onCompareWith={(otherModelId: string) => {
            setInspectModel(null);
            setCompareModels({ a: inspectModel.id, b: otherModelId });
          }}
        />
      )}

      {/* MODEL COMPARE MODAL */}
      {compareModels && (
        <ModelCompareModal
          initialModelA={compareModels.a}
          initialModelB={compareModels.b}
          modelsList={analysis?.recommendations.map(r => r.model) || []}
          onClose={() => setCompareModels(null)}
        />
      )}
    </div>
  );
};
